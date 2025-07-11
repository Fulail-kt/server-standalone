"use strict";
// import mongoose, { Document, Schema } from 'mongoose';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// export interface IHouse extends Document {
//   houseName: string;
//   buildingNo: string;
//   members: mongoose.Types.ObjectId[]; 
//   totalMembers: number;
// }
// const houseSchema = new Schema<IHouse>(
//   {
//     houseName: { type: String, required: true },
//     buildingNo: { type: String, required: true },
//     members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
//     totalMembers: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );
// houseSchema.pre('save', function (next) {
//   this.totalMembers = this.members.length;
//   next();
// });
// export default mongoose.model<IHouse>('House', houseSchema);
const mongoose_1 = __importStar(require("mongoose"));
const houseSchema = new mongoose_1.Schema({
    houseName: { type: String, required: true },
    buildingNo: { type: String, required: true },
    members: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    totalMembers: { type: Number, default: 0 },
}, { timestamps: true });
// Fix the TypeScript errors by adding proper type annotations
houseSchema.pre('save', function (next) {
    this.totalMembers = this.members.length;
    next();
});
exports.default = mongoose_1.default.model('House', houseSchema);
