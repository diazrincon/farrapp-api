const companyCtrl = {};
const mongoose = require('mongoose');

const { Company, Establishment, User } = require('../models/entity.model');
const { postEstablishmentVal } = require('../middlewares/validations/establishment.joi');
const { signUpVal, updateCompany } = require('../middlewares/validations/company.joi');
const validation = require('../middlewares/validations/validation');
const { generatePasswordRand } = require('../utilities/generatePass');
const roles = require('../middlewares/oauth/roles');

/*
Registrar una compañia
 */
async function signUp(req, res) {
  const { email, password, companyName, address, contactNumber, nit } = req.body;
  let generatePass;
  try {
    const user = new User({
      email,
      password,
      hasReqDeactivation: false,
      isActive: false,
      role: 'company',
      isVerified: false,
    });

    if (password) {
      user.password = await user.encryptPassword(password);
    } else {
      generatePass = generatePasswordRand(8, 'alf');
      user.password = await user.encryptPassword(generatePass);
    }

    const saved = await user.save();
    const company = new Company({
      companyName,
      address,
      contactNumber,
      nit,
      // eslint-disable-next-line no-underscore-dangle
      userId: saved._id,
    });
    await company.save();
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `internal server error  ${err}` });
  }

  return res.status(200).json({ message: 'registro completo' });
}

companyCtrl.signUp = [validation(signUpVal), signUp];

/*
Un admin obtiene la información de las compañias
 */
async function getCompanies(req, res) {
  if (!req.payload.role === roles.adminRole) return res.status(403).json({ message: 'Forbidden' });

  const projection = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
  };

  let companies;
  try {
    companies = await Company.find({}, projection);
    if (!companies) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `internal server error  ${err}` });
  }
  return res.status(200).json({ message: companies });
}
companyCtrl.getCompanies = [getCompanies];

/*
Un usuario admin o company con los permisos solicita toda la información de un compañia
 */
async function getCompanyById(req, res) {
  const { companyId } = req.params;
  let id;
  if (req.payload.role === roles.adminRole) {
    id = companyId;
  } else if (req.payload.role === roles.companyRole) {
    if (!req.payload.roleId === companyId)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    id = companyId;
  } else {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const doc = await Company.findOne({ _id: id }, { __v: 0 });
    if (!doc) return res.status(404).json({ message: 'resource not found' });

    return res.status(200).json({ message: doc });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `internal server error  ${err}` });
  }
}

companyCtrl.profile = [getCompanyById];

/*
Actualizar la información del perfil
 */
async function updateProfile(req, res) {
  const { companyId } = req.params;
  if (req.id !== companyId)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });

  const { body } = req;
  const data = {
    $set: body,
  };

  try {
    const update = await Company.updateOne({ _id: req.id }, data);
    if (!update) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `internal server error  ${err}` });
  }

  return res.status(200).json({ message: 'actualización correcta' });
}

companyCtrl.updateProfile = [validation(updateCompany), updateProfile];

async function registerEstablishment(req, res) {
  const { companyId } = req.params;
  if (companyId && companyId !== req.id)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
  try {
    const establishment = new Establishment(req.body);
    const company = await Company.findOne({ _id: req.id }, { _id: 1, companyName: 1 });
    establishment.isActive = true;
    establishment.averageRating = 0;
    establishment.company = {
      // eslint-disable-next-line no-underscore-dangle
      companyId: company._id,
      companyName: company.companyName,
    };
    const establishmentSaved = await establishment.save();
    console.log(establishmentSaved);
    const reviewEstablishment = {
      establishmentName: establishmentSaved.establishmentName,
      city: establishmentSaved.location.city,
      address: establishmentSaved.location.address,
      imageUrl: establishmentSaved.photoUrls[0],
      isActive: establishmentSaved.isActive,
    };

    console.log(reviewEstablishment);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `internal server error  ${err}` });
  }

  return res.status(200).json({ message: 'establescimiento registrado' });
}

companyCtrl.registerEstablishment = [validation(postEstablishmentVal), registerEstablishment];

async function establishmentsOfCompany(req, res) {
  Company.find({ _id: req.params.companyId }, { establishments: 1, _id: 0 })
    .then((establishments) => {
      res.status(200).json({ message: establishments });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError)
        return res
          .status(400)
          .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
      return res.status(500).json({ message: `internal server error  ${err}` });
    });
}

companyCtrl.establishmentsOfCompany = [establishmentsOfCompany];

module.exports = companyCtrl;
