{
    "targets": [{
        "target_name": "wolfcrypt",
        "cflags!": [ "-fno-exceptions" ],
        "cflags_cc!": [ "-fno-exceptions" ],
        "sources": [
            "addon/wolfcrypt/main.cpp",
            "addon/wolfcrypt/evp.cpp",
            "addon/wolfcrypt/hmac.cpp",
            "addon/wolfcrypt/rsa.cpp",
            "addon/wolfcrypt/sha.cpp",
            "addon/wolfcrypt/ecc.cpp",
            "addon/wolfcrypt/pbkdf2.cpp",
            "addon/wolfcrypt/pkcs7.cpp"
        ],
        "include_dirs": [
            "<!@(node -p \"require('node-addon-api').include\")"
        ],
        "libraries": [],
        "dependencies": [
            "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        "defines": [ "NAPI_DISABLE_C_EXCEPTIONS" ],
        "conditions": [
            ['OS=="linux"', {
                "libraries": [
                    "/usr/local/lib/libwolfssl.so"
                ]
            }],
            ['OS=="win"', {
                "libraries": [
                    "C:/workspace/wolfssl-gojimmypi-win/wolfcrypt/test/DLL Release/x64/wolfssl-VS2022.lib",
                    "ws2_32.lib",
                    "crypt32.lib",
                    "advapi32.lib",
                    "user32.lib",
                    "kernel32.lib"
                ],
                "include_dirs": [
                    "C:/workspace/wolfssl-gojimmypi"
                ]
            }],

        ],
        "msvs_settings": {
            "VCCLCompilerTool": {
                "ExceptionHandling": "1",
                "AdditionalOptions": ["/EHsc"]
            }
        }
    }]
}
