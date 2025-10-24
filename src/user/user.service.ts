import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {Model} from "mongoose";
import {User} from './user.schema'
import { CreateUserDto } from "src/dto/create-user.dto";
import { UpdateUserDto } from "src/dto/update-user.dto";

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async createUser(CreateUserDto: CreateUserDto) {
        const existing = await this.userModel.findOne({authId: CreateUserDto.authId})
        if (existing) return existing;

        const user = new this.userModel(CreateUserDto)
        return user.save();
    }

    async updateUser(authId: string, UpdateUserDto: UpdateUserDto) {
        const user = await this.userModel.findOneAndUpdate({authId}, UpdateUserDto, {new: true},);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

     async getUserByAuthId(authId: string) {
        const user = await this.userModel.findOne({ authId });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
}