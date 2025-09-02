"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryBuilders = void 0;
const mongoose_1 = require("mongoose");
const queryBuilders = (model, searchAbleFields) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = Object.assign({}, req.query);
        const filter = Object.assign({}, query);
        const search = query.search;
        const sort = query.sort || "-createdAt";
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const excludeField = ["search", "sort", "page", "limit"];
        for (const field of excludeField) {
            delete filter[field];
        }
        let searchQuery = {};
        if (search && search.trim() !== "") {
            const orConditions = [];
            if (searchAbleFields.includes("initiatedBy")) {
                orConditions.push({ initiatedBy: { $regex: search, $options: "i" } });
            }
            if (searchAbleFields.includes("amount") && !isNaN(Number(search))) {
                orConditions.push({ amount: Number(search) });
            }
            if (searchAbleFields.includes("_id") &&
                mongoose_1.Types.ObjectId.isValid(search)) {
                orConditions.push({ _id: new mongoose_1.Types.ObjectId(search) });
            }
            if (orConditions.length > 0) {
                searchQuery = { $or: orConditions };
            }
        }
        if (filter.type === "all") {
            delete filter.type;
        }
        const data = yield model
            .find(filter)
            .find(searchQuery)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        const totalDocuments = yield model
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
    }
    catch (error) {
        next(error);
    }
});
exports.queryBuilders = queryBuilders;
