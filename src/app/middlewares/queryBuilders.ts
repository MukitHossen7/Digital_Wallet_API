import { NextFunction, Request, Response } from "express";
import { Model, Types } from "mongoose";

export const queryBuilders =
  (model: Model<any>, searchAbleFields: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = { ...req.query };
      const filter: Record<string, any> = { ...query };
      const search = query.search as string;
      const sort = query.sort || "-createdAt";
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;

      const excludeField = ["search", "sort", "page", "limit"];
      for (const field of excludeField) {
        delete filter[field];
      }

      let searchQuery: Record<string, any> = {};
      if (search && search.trim() !== "") {
        const orConditions: any[] = [];

        if (searchAbleFields.includes("initiatedBy")) {
          orConditions.push({ initiatedBy: { $regex: search, $options: "i" } });
        }

        if (searchAbleFields.includes("amount") && !isNaN(Number(search))) {
          orConditions.push({ amount: Number(search) });
        }

        if (
          searchAbleFields.includes("_id") &&
          Types.ObjectId.isValid(search)
        ) {
          orConditions.push({ _id: new Types.ObjectId(search) });
        }

        if (orConditions.length > 0) {
          searchQuery = { $or: orConditions };
        }
      }

      if (filter.type === "all") {
        delete filter.type;
      }

      const data = await model
        .find(filter)
        .find(searchQuery)
        .sort(sort as string)
        .skip(skip)
        .limit(limit);

      const totalDocuments = await model
        .find(filter)
        .find(searchQuery)
        .countDocuments();
      const totalPage = Math.ceil(totalDocuments / limit);
      const meta = {
        page: page,
        limit: limit,
        totalPage: totalPage,
        total: totalDocuments,
      };
      res.locals.data = {
        data,
        meta,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
