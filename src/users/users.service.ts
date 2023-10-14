import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { UpdateUserDto } from './dtos/UpdateUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(data: CreateUserDto) {
    try {
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

    if (data.MLToken && data.MLToken !== user.MLToken) user.MLTokenTimestamp = new Date();
    if (data.MLRefreshToken && data.MLRefreshToken !== user.MLRefreshToken) user.MLRefreshTokenTimestamp = new Date();

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
}
