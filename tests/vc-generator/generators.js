/*!
 * Copyright 2022 Digital Bazaar, Inc. All Rights Reserved
 */
import * as vc from '@digitalbazaar/vc';
import {
  invalidCreateProof,
  invalidCreateVerifyData
} from './helpers.js';
import canonicalize from 'canonicalize';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {documentLoader} from './documentLoader.js';
import {
  cryptosuite as eddsa2022CryptoSuite
} from '@digitalbazaar/eddsa-2022-cryptosuite';
import {klona} from 'klona';

export const vcGenerators = new Map([
  ['issuedVc', _issuedVc],
  ['canonizeJcs', _incorrectCanonize],
  ['digestSha512', _incorrectDigest],
  ['invalidCryptosuite', _incorrectCryptosuite],
  ['invalidProofType', _incorrectProofType],
  ['noCreated', _noCreated],
  ['noVm', _noVm],
  ['noProofPurpose', _noProofPurpose]
]);

async function _noProofPurpose({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({addProofPurpose: false});
  const signedVc = await vc.issue({
    credential: klona(credential),
    suite,
    documentLoader
  });
  return signedVc;
}

async function _noVm({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({addVm: false});
  const signedVc = await vc.issue({
    credential: klona(credential),
    suite,
    documentLoader
  });
  return signedVc;
}

async function _noCreated({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({addCreated: false});
  const signedVc = await vc.issue({
    credential: klona(credential),
    suite,
    documentLoader
  });
  return signedVc;
}

async function _incorrectCryptosuite({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.cryptosuite = 'unknown-cryptosuite-2017';
  const signedVc = await vc.issue({
    credential: klona(credential),
    suite,
    documentLoader
  });
  return signedVc;
}

async function _incorrectProofType({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.type = 'UnknownProofType';
  const signedVc = await vc.issue({
    credential: klona(credential),
    suite,
    documentLoader
  });
  return signedVc;
}

async function _issuedVc({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  const signedVc = await vc.issue({
    credential: klona(credential),
    suite,
    documentLoader
  });
  return signedVc;
}

async function _incorrectCanonize({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  // canonize is expected to be async
  suite.canonize = async input => {
    // this will canonize using JCS
    return canonicalize(input);
  };
  const signedVc = await vc.issue({
    credential: klona(credential),
    suite,
    documentLoader
  });
  return signedVc;
}

async function _incorrectDigest({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createVerifyData = invalidCreateVerifyData;
  const signedVc = await vc.issue({
    credential: klona(credential),
    suite,
    documentLoader
  });
  return signedVc;
}

function _createEddsa2022Suite({signer}) {
  // remove milliseconds precision
  const date = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const cryptosuite = eddsa2022CryptoSuite;
  return new DataIntegrityProof({signer, date, cryptosuite});
}