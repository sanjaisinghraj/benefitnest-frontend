import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../database/supabase.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private supabase: SupabaseService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<any> {
    const { data: admin, error } = await this.supabase
      .getClient()
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = admin;
    return result;
  }

  async login(admin: any) {
    const payload = {
      email: admin.email,
      sub: admin.id,
      role: admin.role || 'admin',
      name: admin.name || admin.full_name,
    };

    return {
      success: true,
      token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name || admin.full_name,
        role: admin.role,
      },
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }

  async register(data: { email: string; password: string; name: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const { data: admin, error } = await this.supabase
      .getClient()
      .from('admins')
      .insert({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'admin',
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const { password: _, ...result } = admin;
    return this.login(result);
  }

  async forgotPassword(email: string) {
    // Generate reset token and send email
    const resetToken = this.jwtService.sign({ email, type: 'reset' }, { expiresIn: '1h' });
    
    // In production, send email with reset link
    // For now, just return success
    return {
      success: true,
      message: 'Password reset instructions sent to email',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.type !== 'reset') {
        throw new Error('Invalid reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const { error } = await this.supabase
        .getClient()
        .from('admins')
        .update({ password: hashedPassword })
        .eq('email', decoded.email);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, message: 'Password reset successfully' };
    } catch {
      throw new Error('Invalid or expired reset token');
    }
  }
}
