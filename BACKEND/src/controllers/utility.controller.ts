import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(__dirname, '../data/india_states_districts.json');

export const getStates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    const states = Object.keys(data).sort();

    res.status(200).json({
      status: 'success',
      data: states
    });
  } catch (error) {
    next(error);
  }
};

export const getDistricts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { state } = req.query;
    if (!state) {
      return res.status(400).json({
        status: 'error',
        message: 'State is required'
      });
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    const districts = data[state as string] || [];

    res.status(200).json({
      status: 'success',
      data: districts.sort()
    });
  } catch (error) {
    next(error);
  }
};
