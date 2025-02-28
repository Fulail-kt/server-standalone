"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
// models/user.model.ts
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt = __importStar(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: false,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
    },
    age: Number,
    blood: String,
    isBloodDonor: {
        type: Boolean,
        default: false,
    },
    houseName: String,
    buildingNo: String,
    maritalStatus: String,
    employmentStatus: String,
    spouse: String,
    fatherName: String,
    motherName: String,
    address: String,
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.USER,
    },
    onboarding: { type: Boolean, default: false },
    image: String,
    access: {
        type: [String],
        default: [],
        validate: {
            validator: function (value) {
                // Only allow access field for ADMIN users
                return this.role === UserRole.ADMIN || value.length === 0;
            },
            message: 'Access field is only allowed for ADMIN users.',
        },
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (_, ret) => {
            delete ret.password;
            return ret;
        }
    }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false;
    return bcrypt.compare(candidatePassword, this.password);
};
exports.User = mongoose_1.default.model('User', userSchema);
