# wolfCrypt Node.JS support

## Requirements

[Node.js](https://nodejs.org/en/download/package-manager)


[npx](https://docs.npmjs.com/cli/v8/commands/npx)


## Description

This Node.js module exposes various wolfCrypt native C functions to Node.js using the Napi library. It makes wolfCrypt functions for ECC, EVP, HMAC, PBKDF2, PKCS7, RSA and SHA available within Nodejs and also provides interface classes that streamline a lot of the tedious actions required when using these functions.

### Native C Functions

The native C functions can be called by importing wolfCrypt from this package:

```
const { wolfcrypt } = require( 'wolfcrypt' )
const message = Buffer.from( 'Hello wolfSSL!' )

// allocate the rsa key
let rsaKey = Buffer.alloc( wolfcrypt.sizeof_RsaKey() )
// init the rsa key
let ret = wolfcrypt.wc_InitRsaKey( rsaKey )
// make a new key
if ( ret == 0 )
  ret = wolfcrypt.wc_MakeRsaKey( rsaKey, 2048, 65537 )
// sign a message
let signature = Buffer.alloc( wolfcrypt.wc_RsaEncryptSize( rsaKey ) )
if ( ret == 0 )
  ret = wolfcrypt.wc_RsaSSL_Sign( message, message.length, signature, signature.length, rsaKey )
// check the signature
if ( ret == signature.length )
  ret = wolfcrypt.wc_RsaSSL_Verify( signature, signature.length, message, message.length, rsaKey )

console.log( ret == message.length )

// free the struct data
ret = wolfcrypt.wc_FreeRsaKey( rsaKey )
```

`ret` will be the return value of the C function. It is important to note that wolfcrypt structures are not managed by the garbage collector and as in the above example the relevant function call must be made to free the memory used by wolfCrypt, in this case `wc_FreeRsaKey`. All of the available C functions can be found in `addon/wolfcrypt/main.cpp`.

### Interface Classes

Alternatively if you find using the native C functions within Node.js to be clunky, interface Classes have been provided to make using wolfCrypt more convenient in Node.js:

```
const { WolfSSLRsa } = require( 'wolfcrypt' )
const message = 'Hello wolfSSL!'

let rsa = new WolfSSLRsa()

try
{
  // make a new key
  rsa.MakeRsaKey( 2048, 65537 )
  // sign a message
  const signature = rsa.SSL_Sign( message )
  // check the signature
  let valid = rsa.SSL_Verify( signature, message )

  console.log( valid )

  // free the struct data
  rsa.free()
}
catch ( e )
{
  console.log( e )
}
```

Instead of needing to check the return value of the C functions, the class will do that for you and throw an error with the wolfSSL error code if anything fails. The free function must still be called to cleanup the internal structure data. The interface classes and their methods can be found in the interfaces folder.

### Streams

The EVP and HMAC interfaces include stream classes that allow them to process data from stream buffers, which is convenient when working with files or http streams:

```
const fs = require( 'fs' )
const { WolfSSLHmacStream } = require( 'wolfcrypt' )

let parts = []
const key = Buffer.from( '12345678901234567890123456789012' )
// create a read stream from the file message.txt
let readStream = fs.createReadStream( 'message.txt' )
let hmacStream = new WolfSSLHmacStream( 'SHA3_512', key )

// collect all the data that come from the hmac stream
hmacStream.on( 'data', function( chunk ) {
  parts.push( chunk )
} )

// called when the end of file has been hashed
hmacStream.on( 'end', function() {
  const fileDigest = Buffer.concat( parts ).toString( 'hex' )

  console.log( fileDigest )
} )

// send the output of the file stream to the hmacStream
readStream.pipe( hmacStream )
```

In the above example we take the contents of `message.txt` and compute the hmac using the provided key and `SHA3_512` as the hashing algorithm.

### Async Support

The RSA and ECC key make functions support async workers and can be called using either a promise or a callback function:

```
const { WolfSSLEcc } = require( 'wolfcrypt' );

( async () => {
  let ecc0 = new WolfSSLEcc()
  let ecc1 = new WolfSSLEcc()

  // make both keys concurrently
  await Promise.all([ ecc0.make_key_promise( 64 ), ecc1.make_key_promise( 64 ) ])

  const secret_0 = ecc0.shared_secret( ecc1 ).toString( 'hex' )
  const secret_1 = ecc1.shared_secret( ecc0 ).toString( 'hex' )

  ecc0.free()
  ecc1.free()

  console.log( secret_0 == secret_1 )
} )()
```

This example uses the `make_key_promise` to make both keys concurrently, but requires promises. The same example using callbacks would look like:

```
const { WolfSSLEcc } = require( 'wolfcrypt' );

let ecc0 = new WolfSSLEcc()
let ecc1 = new WolfSSLEcc()
let readyKeys = 0;

const cb = ( err, ret ) => {
  if ( err || ret != 0 )
  {
    console.log( 'Failed to make key' )
  }
  else
  {
    readyKeys++;

    if ( readyKeys == 2 )
    {
      const secret_0 = ecc0.shared_secret( ecc1 ).toString( 'hex' )
      const secret_1 = ecc1.shared_secret( ecc0 ).toString( 'hex' )

      ecc0.free()
      ecc1.free()

      console.log( secret_0 == secret_1 )
    }
  }
}

// make both keys concurrently
ecc0.make_key_cb( 64, cb )
ecc1.make_key_cb( 64, cb )
```

More examples of how to use the functions in this library can be found in the tests directory

## Building wolfSSL

WolfSSL must be installed on your machine, this package dynamically links it

```
./configure --enable-all
make
sudo make install
```

To link wolfCrypt you need to run `export LD_LIBRARY_PATH=/usr/local/lib` or wherever you have your wolfssl installed:

Verify the .so (shared object) path and version in `binding.gyp`:

```
        'libraries': [
          "/usr/local/lib/libwolfssl.so"
        ],
```

## Package Installation

### Install using npm

```
npm i wolfcrypt
```

Then to import it in your application code

```
const { wolfcrypt, WolfSSLEncryptionStream } = require( 'wolfcrypt' )
...
```

### Install latest main without npm package

```
git clone https://github.com/wolfSSL/wolfcrypt_nodejs
cd wolfcrypt_nodejs
npm i
```

Then copy the directory into your project's `node_modules` folder

```
cp -R wolfcrypt_nodejs my_project/node_modules
```

And import it using the folder name

```
const { wolfcrypt, WolfSSLEncryptionStream } = require( 'wolfcrypt_nodejs' )
...
```

## Visual Studio

## Visual Studio 2022

See:

* [Tutorial: Node.js for Beginners](https://learn.microsoft.com/en-us/visualstudio/javascript/tutorial-nodejs?view=vs-2022)
* [Tutorial: Create a Node.js and Express app in Visual Studio](https://learn.microsoft.com/en-us/visualstudio/javascript/tutorial-nodejs?view=vs-2022)

```powershell
winget install Schniz.fnm
```

Ensure the architecture compiled in Visual Studio matches that in `node`: see `node -p "process.arch"`

```powershell
fnm env --use-on-cd | Out-String | Invoke-Expression
fnm use --install-if-missing 20
node -v # should print `v20.18.0`
npx -v # should print `10.8.2`

# Launch VS2022 from the same shell:
"C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\devenv.exe"
 
cd C:\workspace\wolfcrypt_nodejs-gojimmypi

```

Use the [IDE/WIN10/user_settings.h](https://github.com/gojimmypi/wolfssl/blob/master/IDE/WIN10/user_settings.h) file and
ensure these items are defined:

```c
/* npm */
#define NPM_WOLFCRYPT
#ifdef NPM_WOLFCRYPT
    #undef  HAVE_PKCS7
    #define HAVE_PKCS7
    #define HAVE_AES_KEYWRAP
    #define WOLFSSL_AES_DIRECT
    #define HAVE_X963_KDF
    #define WOLFSSL_SHA224
    #define WOLFSSL_KEY_GEN
#endif
```
There's also a reference file included in the [./lib](./lib) directory [here](./lib/user_settings.h)

See [wolfssl PR #8090](https://github.com/wolfSSL/wolfssl/pull/8090) that adds Visual Studio 2022 project files.

Build wolfssl using Visual Studio and see the resulting files as noted in output:

```
1>   Creating library C:\workspace\wolfssl-gojimmypi-win\DLL Release\x64\wolfssl-VS2022.lib and object C:\workspace\wolfssl-gojimmypi-win\DLL Release\x64\wolfssl-VS2022.exp
1>Generating code
1>0 of 3869 functions ( 0.0%) were compiled, the rest were copied from previous compilation.
1>  0 functions were new in current compilation
1>  0 functions had inline decision re-evaluated but remain unchanged
1>Finished generating code
1>wolfssl-VS2022.vcxproj -> C:\workspace\wolfssl-gojimmypi-win\DLL Release\x64\wolfssl-VS2022.dll
========== Build: 1 succeeded, 0 failed, 0 up-to-date, 0 skipped ==========
========== Build completed at 3:32 PM and took 12.825 seconds ==========
```

In the above case, using the [root level project](https://github.com/gojimmypi/wolfssl/blob/pr-visual-studio-2022/wolfssl-VS2022.vcxproj) 
the resulting file is `C:\workspace\wolfssl-gojimmypi-win\DLL Release\x64\wolfssl-VS2022.lib`. 

It is best to convert the Windows `\` to `/`.

If instead conpiled with the `wolfcrypt/test` app, the lib file will be in:

`C:/workspace/wolfssl-gojimmypi-win/wolfcrypt/test/DLL Release/x64/wolfssl-VS2022.lib`


If this error is observed (missing `wolfssl/options.h`), see [wolfSSL install](https://github.com/gojimmypi/wolfssl/blob/master/INSTALL).

```text
gyp info spawn args ]

  nothing.c
  win_delay_load_hook.cc
  nothing.vcxproj -> C:\workspace\wolfcrypt_nodejs-gojimmypi\build\Release\\nothing.lib
  main.cpp
C:\workspace\wolfcrypt_nodejs-gojimmypi\addon\wolfcrypt\h\evp.h(25,10): error C1083: Cannot open include file: 'wolfssl/options.h': No such file or directory [C
:\workspace\wolfcrypt_nodejs-gojimmypi\build\wolfcrypt.vcxproj]
  (compiling source file '../addon/wolfcrypt/main.cpp')

gyp ERR! build error
gyp ERR! stack Error: `C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe` failed with exit code: 1
gyp
```

If this `Error: The specified module could not be found.` is observed: 

```text
C:\workspace\wolfcrypt_nodejs-gojimmypi>npm run test

> wolfcrypt@1.0.3 test
> node test.js

node:internal/modules/cjs/loader:1586
  return process.dlopen(module, path.toNamespacedPath(filename));
                 ^

Error: The specified module could not be found.
\\?\C:\workspace\wolfcrypt_nodejs-gojimmypi\build\Release\wolfcrypt.node
    at Module._extensions..node (node:internal/modules/cjs/loader:1586:18)
    at Module.load (node:internal/modules/cjs/loader:1288:32)
    at Module._load (node:internal/modules/cjs/loader:1104:12)
    at Module.require (node:internal/modules/cjs/loader:1311:19)
    at require (node:internal/modules/helpers:179:18)
    at Object.<anonymous> (C:\workspace\wolfcrypt_nodejs-gojimmypi\interfaces\ecc.js:21:19)
    at Module._compile (node:internal/modules/cjs/loader:1469:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1548:10)
    at Module.load (node:internal/modules/cjs/loader:1288:32)
    at Module._load (node:internal/modules/cjs/loader:1104:12) {
  code: 'ERR_DLOPEN_FAILED'
}

Node.js v20.18.0
```

Ensure the DLL can be found, either copied locally or in the path:

```dos
set PATH=%PATH%;C:\workspace\wolfssl-gojimmypi-win\wolfcrypt\test\DLL Release\x64\
```


### wolfSSL Configuration Notes

Note that the `options.h` definition should match those from the compiled lib file that used the respective 
Windows [user_settings.h](https://github.com/gojimmypi/wolfssl/blob/master/IDE/WIN10/user_settings.h).


Clean build:

```powershell
npm run clean
node-gyp clean
node-gyp rebuild
```

See the `my_test.ps1` script:

```
powershell -ExecutionPolicy Bypass -File .\my_test.ps1
```
## Tests Output

```
$ npm run test
PASS ecc makeKey
PASS ecc sharedSecret32
PASS ecc sharedSecret64
PASS ecc signVerify
PASS ecc importExportx963
PASS ecc importExportDer
PASS evp encrypt
PASS evp decrypt
PASS evp encrypt_decrypt_odd
PASS evp encryptionStream
PASS evp decryptionStream
PASS evp encryptDecryptPipes
PASS hmac hmac
PASS hmac hmacStream
PASS hmac hmacPipe
PASS pbkdf2
PASS pkcs7 addCertificate
PASS pkcs7 encodeData
PASS pkcs7 signVerify
PASS pkcs7 getAttribute
PASS pkcs7 getSid
PASS rsa keyToDer
PASS rsa keyToPublicDer
PASS rsa privateKeyDecode
PASS rsa publicKeyDecode
PASS rsa encryptDecrypt
PASS rsa signVerify
PASS sha sha
PASS sha sha224
PASS sha sha256
PASS sha sha384
PASS sha sha512
PASS sha sha512_224
PASS sha sha512_256
```
