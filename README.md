### Description
this module is extending from [@nestjs/axios](https://www.npmjs.com/package/@nestjs/axios) with circuit breaker pattern we use [opossum](https://github.com/nodeshift/opossum).

that make we can fail fast if the target are failed, and let them have some time to recover. if we try to make some new request at the time. we can fail fast without request to them.

## How To Install
make sure you have [@nestjs/axios](https://www.npmjs.com/package/@nestjs/axios) installed in your package.json. minimum version `0.1.0`
you can double check what is the newest version of this package and replace `#semver:^1.0.12` to the new version that you can see.

```
npm install @nestjs/axios git+ssh://git@github.com:FauziFadhi/rgb-safe-request.git#semver:^1.0.12
```

## How to Use
import `SafeRequestModule` from `@rgb/safe-request` to module that you want to use request
```
// file user.module.ts
@Module({
  imports: [SafeRequestModule],
  provider: [UserService],
})
```

import `SafeRequest` from `@rgb/safe-request`, and inject to target class.
```
// file user.service.ts

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: SafeRequest,
  ){}
}

async getUsersFromProvider(id: number) {
  const resp = await this.httpService.get('users', {
    baseUrl: 'https://api-rgb.com,
  })
}
```

as you can see you just the function like you use httpService from `@nestjs/axios`. but with additional attribute `circuitBreaker` for circuit breaker config.

### Example
```
  const resp = await this.httpService.get('users', {
    baseUrl: 'https://api-rgb.com,
    circuitBreaker: { // <-- additional attribute for circuit breaker config
      timeout: 3000,
      errorThresholdPercentage: 40,
    }
  })
```

you can see other config at its documentation [opossum](https://github.com/nodeshift/opossum).

we make override some opossum config, these are the config that we overrided:
```
circuitBreaker: {
  timeout: 1500,
  errorThresholdPercentage: 51,
  volumeThreshold: 3,
  errorFilter: (err) => {
    if (err.response?.status < 500) {
      return true;
    }
    return false;
  },
}
```
you just put your config if you want to override this default config from this package. if you do not want to just let it be.
