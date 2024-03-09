import { Injectable } from '@nestjs/common';
import { createDecipheriv, createCipheriv } from 'crypto';
import { KEYS } from '../const/comon.const';

@Injectable()
export class CryptoService {
  private algorithm = 'aes-256-cbc';
  private key = Buffer.from(KEYS.encrypt_decrypt_secret, 'base64');
  private iv = this.key.subarray(0, 16);

  async decrypt(text: any, hashKeys?: any) {
    const encryptedText = Buffer.from(text, 'hex');
    const decipher = createDecipheriv(this.algorithm, hashKeys ?? this.key, this.iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  async encrypt(text: any, hashKeys?: any) {
    const cipher = createCipheriv(this.algorithm, hashKeys ?? this.key, this.iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  }
}
