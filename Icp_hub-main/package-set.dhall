let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.11.1-20240411/package-set.dhall

in upstream # [
  { name = "encoding"
  , repo = "https://github.com/aviate-labs/encoding.mo"
  , version = "v1.0.0"
  , dependencies = [ "base" ]
  },
  { name = "sha2"
  , repo = "https://github.com/research-ag/sha2"
  , version = "v2.0.0" 
  , dependencies = [ "base" ]
  }
]