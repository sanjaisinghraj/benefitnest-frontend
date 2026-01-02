import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('admin')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    if (!email || !password) {
      throw new HttpException(
        { success: false, message: 'Email and password required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const admin = await this.authService.validateAdmin(email, password);

    if (!admin) {
      throw new HttpException(
        { success: false, message: 'Invalid credentials' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.authService.login(admin);
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string; name: string }) {
    try {
      return await this.authService.register(body);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    try {
      return await this.authService.resetPassword(body.token, body.newPassword);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
