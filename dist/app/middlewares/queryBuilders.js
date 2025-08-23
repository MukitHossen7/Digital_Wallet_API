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
const queryBuilders = (model) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = Object.assign({}, req.query);
        const filter = Object.assign({}, query);
        const sort = query.sort || "-createdAt";
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const excludeField = ["sort", "page", "limit"];
        for (const field of excludeField) {
            delete filter[field];
        }
        const data = yield model
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        const totalDocuments = yield model.countDocuments();
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
