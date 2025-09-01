let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.11.1-20240411/package-set.dhall

in upstream # [
  { name = "encoding"
  , repo = "https://github.com/aviate-labs/encoding.mo"
  , version = "v0.1.0"
  , dependencies = [ "base" ]
  }
]