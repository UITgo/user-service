import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true })
    authId: string;

    @Prop({ required: true })
    fullname: string;

    @Prop({ default: '' })
    avatar: string;

    @Prop({ required: true, enum: ['PASSENGER', 'DRIVER'] })
    role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);