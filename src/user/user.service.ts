import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {Model} from "mongoose";
import {User} from './user.schema'
import { CreateUserDto } from "src/dto/create-user.dto";
import { S3Service } from '../s3/s3.service';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly s3Service: S3Service,
    ) {}

    async createuser(CreateUserDto: CreateUserDto) {
        const existing = await this.userModel.findOne({authId: CreateUserDto.authId})
        if (existing) return existing;

        const user = new this.userModel({
            authId: CreateUserDto.authId,
            fullname: CreateUserDto.fullname
        });

        return user.save();
    }

    async uploadAvatar(authId: string, file: Express.Multer.File) {
        const { key, url } = await this.s3Service.uploadfile(file, authId);
        await this.userModel.findOneAndUpdate(
            {authId}, 
            { avatar: url },
            { new: true });
        return { avatar: url };
    }

     async getUserbyId(authId: string) {
        const user = await this.userModel.findOne({ authId });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
}