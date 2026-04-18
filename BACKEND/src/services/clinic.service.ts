import Clinic, { IClinic } from '../models/Clinic';
import { AppError } from '../middlewares/error';

export const getAllClinics = async (query: any) => {
  const { lat, lng, radius = 5000 } = query;
  const filter: any = {};

  if (lat && lng) {
    filter.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseInt(radius),
      },
    };
  }

  return await Clinic.find(filter).populate('owner', 'name email');
};

export const getClinicById = async (id: string) => {
  const clinic = await Clinic.findById(id).populate('owner', 'name email');
  if (!clinic) {
    throw new AppError('Clinic not found', 404);
  }
  return clinic;
};

export const createClinic = async (data: Partial<IClinic>) => {
  return await Clinic.create(data);
};

export const updateClinic = async (id: string, ownerId: string, data: Partial<IClinic>) => {
  const clinic = await Clinic.findOneAndUpdate({ _id: id, owner: ownerId }, data, {
    new: true,
    runValidators: true,
  });

  if (!clinic) {
    throw new AppError('Clinic not found or you are not authorized', 404);
  }
  return clinic;
};
