"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBySendMoneyFee = void 0;
const calculateBySendMoneyFee = (amount, feePerThousand = 5) => {
    if (amount < 1000) {
        return {
            totalAmount: amount,
            fee: 0,
        };
    }
    const fee = feePerThousand;
    const totalAmount = parseFloat((amount + fee).toFixed(2));
    return { totalAmount, fee };
};
exports.calculateBySendMoneyFee = calculateBySendMoneyFee;
