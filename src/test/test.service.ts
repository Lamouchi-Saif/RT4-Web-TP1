import { Inject, Injectable } from '@nestjs/common';
import { UUID_TOKEN } from '../common/providers/uuid.provider.js';

@Injectable()
export class TestService {
    constructor(@Inject(UUID_TOKEN) private readonly uuid: ()=> string) {}

    getId(): string {
        return this.uuid();
    }
}
