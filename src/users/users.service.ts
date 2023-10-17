import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { UpdateUserDto } from './dtos/UpdateUser.dto';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
@Injectable()
export class UsersService {
  private ENCRYPTION_KEY;
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {
    this.ENCRYPTION_KEY = this.configService.get('ENCRYPTION_KEY');
  }

  async create(data: CreateUserDto) {
    try {
      data.MLToken = await this.encodeString(data.MLToken);
      data.MLRefreshToken = await this.encodeString(data.MLRefreshToken);
      const user = await this.userModel.create({
        ...data,
        MLTokenTimestamp: new Date(),
        MLRefreshTokenTimestamp: new Date(),
      });
      return user;
    } catch (error) {
      if (error?.code === 11000) return this.updateByUserId(data.userId, data);
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async updateByUserId(userId: string, data: UpdateUserDto) {
    const user: User = await this.findUserByUserId(userId);

    if (data.MLToken && data.MLToken !== user.MLToken) {
      user.MLTokenTimestamp = new Date();
      user.MLToken = await this.encodeString(user.MLToken);
    }
    if (data.MLRefreshToken && data.MLRefreshToken !== user.MLRefreshToken) {
      user.MLRefreshTokenTimestamp = new Date();
      user.MLRefreshToken = await this.encodeString(user.MLRefreshToken);
    }

    if (data.userId) user.userId = data.userId;
    if (data.MLUserID) user.MLUserID = data.MLUserID;
    if (data.MLToken) user.MLToken = data.MLToken;
    if (data.MLRefreshToken) user.MLRefreshToken = data.MLRefreshToken;

    await user.save();

    return user;
  }

  async findUserByUserId(userId: string): Promise<User> {
    const user = await this.userModel.findOne({ userId });
    if (!user) throw new NotFoundException(`User with userId #${userId} not found.`);
    return user;
  }

  async findUserByMLUserID(MLUserID: string): Promise<User> {
    const user = await this.userModel.findOne({ MLUserID });
    if (!user) throw new NotFoundException(`User with MLUserID #${MLUserID} not found.`);
    return user;
  }

  encodeString = async (value) => CryptoJS.AES.encrypt(value, this.ENCRYPTION_KEY).toString();

  decodeString = async (encrypted) => CryptoJS.AES.decrypt(encrypted, this.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
}
