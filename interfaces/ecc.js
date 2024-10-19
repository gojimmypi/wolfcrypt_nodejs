/* ecc.js
 *
 * Copyright (C) 2006-2022 wolfSSL Inc.
 *
 * This file is part of wolfSSL.
 *
 * wolfSSL is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * wolfSSL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1335, USA
 */
const wolfcrypt = require( '../build/Release/wolfcrypt' )

class WolfSSLEcc
{
  /**
   * Creates a new ecc_key structure by calling sizeof_ecc_key and wc_ecc_init
   *
   * @remarks free must be called to free the ecc key data
   */
  constructor()
  {
    this.ecc = Buffer.alloc( wolfcrypt.sizeof_ecc_key() )

    let ret = wolfcrypt.wc_ecc_init( this.ecc )

    if ( ret != 0 )
    {
      throw `Failed to wc_ecc_init ${ ret }`
    }
  }

  /**
   * Makes a new ecc key and fills the ecc struct with the key data
   *
   * @param size The size of the ecc key.
   *
   * @throws {Error} If the ecc key is not allocated.
   *
   * @throws {Error} If wc_ecc_make_key fails.
   */
  make_key( size )
  {
    if ( this.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    let ret = wolfcrypt.wc_ecc_make_key( size, this.ecc )

    if ( ret != 0 )
    {
      throw `Failed to wc_ecc_make_key ${ ret }`
    }
  }

  /**
   * Makes a new ecc key and fills the ecc struct with the key data, callback
   *
   * @param size The size of the ecc key.
   *
   * @param cb The callback function to call when the key has been completed.
   *
   * @throws {Error} If the ecc key is not allocated.
   */
  make_key_cb( size, cb )
  {
    if ( this.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    wolfcrypt.wc_ecc_make_key_async( size, this.ecc, cb )
  }

  /**
   * Makes a new ecc key and fills the ecc struct with the key data, promise
   *
   * @param size The size of the ecc key.
   *
   * @returns A promise that will resolve when the key is ready and reject if the key fails.
   *
   * @throws {Error} If the ecc key is not allocated.
   */
  make_key_promise( size )
  {
    if ( this.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    return new Promise( ( res, rej ) => {
      wolfcrypt.wc_ecc_make_key_async( size, this.ecc, ( err, ret ) => {
        if ( err )
        {
          return rej( err )
        }

        if ( ret != 0 )
        {
          return rej( ret )
        }

        res()
      } )
    } );
  }

  /**
   * Exports the ecc public key in x963 format
   *
   * @returns The x963 public key as a data Buffer.
   *
   * @throws {Error} If the ecc key is not allocated.
   *
   * @throws {Error} If wc_ecc_export_x963 fails.
   */
  export_x963()
  {
    if ( this.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    // passing null will return the size
    let asnBuf = Buffer.alloc( wolfcrypt.sizeof_ecc_x963( this.ecc ) )

    let ret = wolfcrypt.wc_ecc_export_x963( this.ecc, asnBuf, asnBuf.length )

    if ( ret <= 0 )
    {
      throw `Failed to wc_ecc_export_x963 ${ ret }`
    }

    asnBuf = asnBuf.subarray( 0, ret )

    return asnBuf
  }

  /**
   * Imports the ecc public key from x963 format
   *
   * @param asnBuf A data Buffer containing the x963 key.
   *
   * @throws {Error} If the ecc key is not allocated.
   *
   * @throws {Error} If ansBuf is not a Buffer.
   *
   * @throws {Error} If wc_ecc_import_x963 fails.
   */
  import_x963( asnBuf )
  {
    if ( this.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    if ( !Buffer.isBuffer( asnBuf ) )
    {
      throw `asnBuf must be a Buffer`
    }

    let ret = wolfcrypt.wc_ecc_import_x963( asnBuf, asnBuf.length, this.ecc )

    if ( ret != 0 )
    {
      throw `Failed to wc_ecc_export_x963 ${ ret }`
    }
  }

  /**
   * Exports the ecc public key to Der format
   *
   * @returns The Der public key as a data Buffer.
   *
   * @throws {Error} If the ecc key is not allocated.
   *
   * @throws {Error} If wc_EccPublicKeyToDer fails.
   */
  PublicKeyToDer()
  {
    if ( this.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    let derBuf = Buffer.alloc( wolfcrypt.wc_EccPublicKeyDerSize( this.ecc ) )

    let ret = wolfcrypt.wc_EccPublicKeyToDer( this.ecc, derBuf, derBuf.length )

    if ( ret <= 0 )
    {
      throw `Failed to wc_EccPublicKeyToDer ${ ret }`
    }

    return derBuf
  }

  /**
   * Imports the ecc public key from Der format
   *
   * @param derBuf A data Buffer containing the Der public key.
   *
   * @throws {Error} If the ecc key is not allocated.
   *
   * @throws {Error} If derBuf is not a Buffer.
   *
   * @throws {Error} If wc_EccPublicKeyDecode fails.
   */
  PublicKeyDecode( derBuf )
  {
    if ( this.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    if ( !Buffer.isBuffer( derBuf ) )
    {
      throw 'Public key der must be a Buffer'
    }

    let ret = wolfcrypt.wc_EccPublicKeyDecode( derBuf, this.ecc, derBuf.length )

    if ( ret != 0 )
    {
      throw `Failed to wc_EccPublicKeyDecode ${ ret }`
    }
  }

  /**
   * Exports the ecc private key to Der format
   *
   * @returns The Der private key as a data Buffer.
   *
   * @throws {Error} If the ecc key is not allocated.
   *
   * @throws {Error} If wc_EccPrivateKeyToDer fails.
   */
  PrivateKeyToDer()
  {
    if ( this.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    let derBuf = Buffer.alloc( wolfcrypt.wc_EccKeyDerSize( this.ecc, 0 ) )

    let ret = wolfcrypt.wc_EccPrivateKeyToDer( this.ecc, derBuf, derBuf.length )

    if ( ret <= 0 )
    {
      throw `Failed to wc_EccPrivateKeyToDer ${ ret }`
    }

    return derBuf
  }

  /**
   * Imports the ecc private key from Der format
   *
   * @param derBuf A data Buffer containing the Der private key.
   *
   * @throws {Error} If the ecc key is not allocated.
   *
   * @throws {Error} If derBuf is not a Buffer.
   *
   * @throws {Error} If wc_EccPrivateKeyDecode fails.
   */
  PrivateKeyDecode( derBuf )
  {
    if ( this.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    if ( !Buffer.isBuffer( derBuf ) )
    {
      throw 'Private key der must be a Buffer'
    }

    let ret = wolfcrypt.wc_EccPrivateKeyDecode( derBuf, this.ecc, derBuf.length )

    if ( ret != 0 )
    {
      throw `Failed to wc_EccPrivateKeyDecode ${ ret }`
    }
  }

  /**
   * Sets the key size and curveId that the ecc key is to use
   *
   * @param keySize Size of the ecc key.
   *
   * @param curveId Curveid that matches to an ecc_set within wolfcrypt.
   *
   * @throws {Error} If the ecc key is not allocated.
   *
   * @throws {Error} If wc_ecc_set_curve fails.
   */
  set_curve( keySize, curveId )
  {
    if ( this.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    let ret = wolfcrypt.wc_ecc_set_curve( this.ecc, keySize, curveId )

    if ( ret != 0 )
    {
      throw `Failed to wc_ecc_set_curve ${ ret }`
    }
  }

  /**
   * Computes the shared secret of this key and the key passed in
   *
   * @param pubEcc Public key to use with this private key.
   *
   * @returns The shared secret as a data Buffer.
   *
   * @throws {Error} If either ecc key is not allocated.
   *
   * @throws {Error} If wc_ecc_size fails.
   *
   * @throws {Error} If wc_ecc_shared_secret fails.
   */
  shared_secret( pubEcc )
  {
    if ( this.ecc == null || pubEcc.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    const keySize = wolfcrypt.wc_ecc_size( this.ecc )

    if ( keySize <= 0 )
    {
      throw `Failed to ecc_key_size ${ keySize }`
    }

    let secret = Buffer.alloc( keySize )
    console.log("shared_secret keySize = %d ", keySize)
    let ret = wolfcrypt.wc_ecc_shared_secret( this.ecc, pubEcc.ecc, secret, keySize )

    if ( ret != keySize )
    {
      throw `Failed to wc_ecc_shared_secret ${ ret }`
    }

    return secret
  }

  /**
   * Computes the signature of the data passed in using this private key
   *
   * @param data The data to be signed, as string or Buffer.
   *
   * @returns The signature for this data.
   *
   * @throws {Error} If ecc key is not allocated.
   *
   * @throws {Error} If wc_ecc_sig_size fails.
   *
   * @throws {Error} If wc_ecc_sign_hash fails.
   */
  sign_hash( data )
  {
    if ( this.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    if ( typeof data == 'string' )
    {
      data = Buffer.from( data )
    }

    const sigSize = wolfcrypt.wc_ecc_sig_size( this.ecc )

    if ( sigSize <= 0 )
    {
      throw `Failed to wc_ecc_sig_size ${ ret }`
    }

    let sig = Buffer.alloc( sigSize )

    let ret = wolfcrypt.wc_ecc_sign_hash( data, data.length, sig, sig.length, this.ecc )

    if ( ret <= 0 )
    {
      throw `Failed to wc_ecc_sign_hash ${ ret }`
    }

    sig = sig.subarray( 0, ret )

    return sig;
  }

  /**
   * Verifies the signature of the data passed in using this public key
   *
   * @param sig The signature to verify.
   *
   * @param hash The original data that the signature was generated from, as a string or Buffer.
   *
   * @returns true if the signature matches, false otherwise.
   *
   * @throws {Error} If ecc key is not allocated.
   *
   * @throws {Error} If wc_ecc_verify_hash fails.
   */
  verify_hash( sig, hash )
  {
    if ( this.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    if ( typeof sig == 'string' )
    {
      sig = Buffer.from( sig )
    }

    if ( typeof hash == 'string' )
    {
      hash = Buffer.from( hash )
    }

    let ret = wolfcrypt.wc_ecc_verify_hash( sig, sig.length, hash, hash.length, this.ecc )

    if ( ret < 0 )
    {
      throw `Failed to wc_ecc_verify_hash ${ ret }`
    }

    if ( ret == 1 )
    {
      return true
    }

    return false
  }

  /**
   * Frees the data allocated by the ecc key
   *
   * @throws {Error} If ecc key is not allocated.
   *
   * @throws {Error} If wc_ecc_free fails.
   */
  free()
  {
    if ( this.ecc == null )
    {
      throw 'Ecc not allocated'
    }

    let ret = wolfcrypt.wc_ecc_free( this.ecc )
    this.ecc = null

    if ( ret != 0 )
    {
      throw `Failed to wc_ecc_free ${ ret }`
    }
  }
}

exports.WolfSSLEcc = WolfSSLEcc
