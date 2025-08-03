"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayType = exports.InitiatedBy = exports.PayStatus = void 0;
var PayStatus;
(function (PayStatus) {
    PayStatus["PENDING"] = "PENDING";
    PayStatus["COMPLETED"] = "COMPLETED";
    PayStatus["FAILED"] = "FAILED";
    PayStatus["REVERSED"] = "REVERSED";
})(PayStatus || (exports.PayStatus = PayStatus = {}));
var InitiatedBy;
(function (InitiatedBy) {
    InitiatedBy["USER"] = "USER";
    InitiatedBy["AGENT"] = "AGENT";
})(InitiatedBy || (exports.InitiatedBy = InitiatedBy = {}));
var PayType;
(function (PayType) {
    PayType["ADD_MONEY"] = "ADD_MONEY";
    PayType["WITHDRAW"] = "WITHDRAW";
    PayType["SEND_MONEY"] = "SEND_MONEY";
})(PayType || (exports.PayType = PayType = {}));
