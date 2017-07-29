#include "colors.inc"
#include "woods.inc"
#include "textures.inc"
// unit is centimeter

#declare _texNeutral = texture {
  pigment { color rgb <0.75, 0.75, 0.75> }
  finish { ambient 0.1 diffuse 0.6 phong 0.0}
}

#declare _texBoard = texture {
  Yellow_Pine
  //T_Wood34
  //T_Wood28
  //T_Wood21
  rotate y * 90.0
}

#declare _texVarnish = texture {
  pigment { color rgbft <1.0,1.0,1.0,1.0> }
  finish { 
    phong 0.1
    phong_size 50.0
    reflection 0.025
  }
}

#declare _tex = texture {
  pigment { color White }
}

#declare RndSeed = seed(10); //30
#declare RndSeedScratch = seed(3);
#declare _posCamera = <0.0,30.0,0.0>;
#declare _lookAt = <0.0,0.0,0.0>;

#declare _nbHolePlayer = 6;
#declare _holeSize = 4.0;
#declare _boardWidth = _holeSize * 3.0;
#declare _boardLength = _holeSize * (_nbHolePlayer + 1);
#declare _boardHeight = _holeSize * 1.5;

camera {
  orthographic
  location    _posCamera
  sky z
  right x * (_boardLength + .1)
  up z * (_boardWidth + .1)
  look_at     _lookAt
}

light_source {
  _posCamera
  color rgb 1.0
  area_light <-0.5 * _boardLength, 0, -0.5 * _boardWidth>,
    <0.5 * _boardLength, 0, 0.5 * _boardWidth>, 6, 5
  adaptive 1
  jitter
}

background { color rgbft <1.0, 1.0, 1.0, 1.0, 1.0> }

global_settings { ambient_light 0 radiosity {brightness 0.5}}

#declare _boardBase = union {
  box { 
    <-3.0 * _holeSize, 0.0, -1.5 * _holeSize> 
    <3.0 * _holeSize, _boardHeight, 1.5 * _holeSize> 
  }
  box { 
    <-3.5 * _holeSize, 0.0, -1.0 * _holeSize> 
    <3.5 * _holeSize, _boardHeight, 1.0 * _holeSize> 
  }
  cylinder {
    <-3.0 * _holeSize, 0.0, -1.0 * _holeSize>
    <-3.0 * _holeSize, _boardHeight, -1.0 * _holeSize>
    0.5 * _holeSize
  }
  cylinder {
    <3.0 * _holeSize, 0.0, -1.0 * _holeSize>
    <3.0 * _holeSize, _boardHeight, -1.0 * _holeSize>
    0.5 * _holeSize
  }
  cylinder {
    <-3.0 * _holeSize, 0.0, 1.0 * _holeSize>
    <-3.0 * _holeSize, _boardHeight, 1.0 * _holeSize>
    0.5 * _holeSize
  }
  cylinder {
    <3.0 * _holeSize, 0.0, 1.0 * _holeSize>
    <3.0 * _holeSize, _boardHeight, 1.0 * _holeSize>
    0.5 * _holeSize
  }
}

#declare _boardCarveSurface = union {
  #local _nbCarve = 1000;
  #local _iCarve = 0;
  #local _depthCarve = 0.2;
  #local _sizeCarve = 0.5;
  #while (_iCarve < _nbCarve)
    sphere {
      0.0, 1.0
      scale <_sizeCarve * (1.5 + rand(RndSeed)), 
        _depthCarve * (rand(RndSeed) * 0.5 + 0.5), 
        _sizeCarve>
      rotate y * (rand(RndSeed) - 0.5) * 20.0
      translate <(rand(RndSeed) - 0.5) * _boardLength,
        _boardHeight + _depthCarve * 0.25 * rand(RndSeed),
        (rand(RndSeed) - 0.5) * _boardWidth>
    }
    #declare _iCarve = _iCarve + 1;
  #end
}

#declare _boardScratchSurface = union {
  #local _nbCarve = 40; //20;
  #local _iCarve = 0;
  #local _depthCarve = 0.15;
  #local _sizeCarve = 2.0;
  #while (_iCarve < _nbCarve)
    sphere {
      0.0, 1.0
      scale <_sizeCarve * (0.5 + rand(RndSeedScratch)), 
        _depthCarve * (rand(RndSeedScratch) * 0.5 + 0.5), 
        0.025 + 0.025 * rand(RndSeedScratch)>
      rotate y * (rand(RndSeedScratch) - 0.5) * 180.0
      translate <(rand(RndSeedScratch) - 0.5) * _boardLength,
        _boardHeight// + _depthCarve * 0.3 * rand(RndSeedScratch),
        (rand(RndSeedScratch) - 0.5) * _boardWidth>
    }
    #declare _iCarve = _iCarve + 1;
  #end
}

#declare _boardCarveHoles = union {
  #local _relSizeHole = 0.35;
  #local _iPlayer = 0;
  #while (_iPlayer < 2)
    #local _iHole = 0;
    #while (_iHole < _nbHolePlayer)
    //#while (_iHole < 1)
      sphere {
        0.0, _holeSize * _relSizeHole
        translate <
          _holeSize * (_iHole + 0.5 - 0.5 * _nbHolePlayer),
          _boardHeight, _holeSize * (-0.5 + _iPlayer)>
      }

      #local _nbCarve = 200;
      #local _iCarve = 0;
      #local _sizeCarve = _holeSize * _relSizeHole * 0.6;
      #while (_iCarve < _nbCarve)
        sphere {
          0.0, 1.0
          #local _l = sqrt(_holeSize * _relSizeHole *
            _holeSize * _relSizeHole + 
            _sizeCarve * _sizeCarve);
          #local _lp = _holeSize * _relSizeHole - _l;
          scale <_sizeCarve, 
            _lp + (_sizeCarve - _lp) * rand(RndSeed) * 0.75, 
            _sizeCarve>
          translate y * -0.8 * _l
          rotate x * (rand(RndSeed) - 0.5) * 200.0
          rotate y * rand(RndSeed) * 360.0
          translate <
            _holeSize * (_iHole + 0.5 - 0.5 * _nbHolePlayer),
            _boardHeight, _holeSize * (-0.5 + _iPlayer)>
        }
        #declare _iCarve = _iCarve + 1;
      #end

      #declare _iHole = _iHole + 1;
    #end
    #declare _iPlayer = _iPlayer + 1;
  #end
}

#declare _boardCarve = union {
  object { _boardCarveSurface }
  object { _boardScratchSurface }
  object { _boardCarveHoles }
}
  
#declare _board = difference {
  object { _boardBase }
  object { _boardCarve }
  //texture { _texNeutral } 
  texture { _texBoard } 
  texture { _texVarnish }
}

object {
  _board
}
