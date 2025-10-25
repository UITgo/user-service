import { Injectable, InternalServerErrorException } from "@nestjs/common";
import {S3Client, PutObjectCommand, GetObjectCommand,DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from "crypto";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
    private s3:S3Client;
    private bucketname: string;
    constructor(private ConfigService: ConfigService) {
        this.s3 = new S3Client ({
          region: this.ConfigService.get<string>('AWS_REGION')!,
          credentials: {
            accessKeyId: this.ConfigService.get<string>('AWS_ACCESS_KEY')!,
            secretAccessKey: this.ConfigService.get<string>('AWS_SECRET_KEY')!,
          }  
        });
        this.bucketname = this.ConfigService.get<string>('AWS_S3_BUCKET')!;
    }

    async uploadfile(file: Express.Multer.File, authId: string) {
        const key = `users/${authId}/${Date.now()}-${randomUUID()}-${file.originalname}`;
        await this.s3.send(
        new PutObjectCommand({
            Bucket: this.bucketname,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype, }),
        );

        const url = await getSignedUrl(
            this.s3,
            new GetObjectCommand({ Bucket: this.bucketname, Key: key }),
            { expiresIn: 3600 },
        );

        return { key, url };
    }

    async getfileurl(key: string) {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: this.bucketname,
        Key: key,
      }),
      { expiresIn: 3600 },
    );
  }


    async deletefile(key: string) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucketname,
        Key: key,
      }),
    );
    return { message: `Deleted ${key}` };
  }
}