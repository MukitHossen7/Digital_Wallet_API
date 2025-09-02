"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTotalWithFee = void 0;
const calculateTotalWithFee = (amount, feePerThousand = 10) => {
    const feeRate = feePerThousand / 1000;
    const fee = parseFloat((amount * feeRate).toFixed(2));
    const totalAmount = parseFloat((amount + fee).toFixed(2));
    return { totalAmount, fee };
};
exports.calculateTotalWithFee = calculateTotalWithFee;
