#include "colors.inc"
#include "stones.inc"
#include "textures.inc"
// unit is centimeter

#declare _texNeutral = texture {
  pigment { color rgb <0.75, 0.75, 0.75> }
  finish { ambient 0.1 diffuse 0.6 phong 0.0}
}

#declare RndSeed = seed(clock);
#declare _posCamera = <0.0,10.0,0.0>;
#declare _lookAt = <0.0,0.0,0.0>;

camera {
  orthographic
  location _posCamera
  sky z
  right x
  up z
  look_at _lookAt
}

light_source {
  _posCamera
  color rgb 1.0
  area_light <-0.5, 0, -0.5>, <0.5, 0, 0.5>, 3, 3
  adaptive 1
  jitter
}

background { color rgbft <1.0, 1.0, 1.0, 1.0, 1.0> }

global_settings { ambient_light 0 radiosity {brightness 0.5}}

#declare _stone = blob {
  threshold 1.0
  #local _v = 0.35;
  #local _r = 0.5;
  #local _d = 0.4 * _r;
  #local iSphere = 0;
  #while (iSphere < 4)
    #local _s = 1.0/((1.0-(_d/_r)*(_d/_r))*(1.0-(_d/_r)*(_d/_r)));
    sphere { 
      <_v * (rand(RndSeed) - 0.5), 
      _v * (rand(RndSeed) - 0.5), 
      _v * (rand(RndSeed) - 0.5)>, 
      _r, _s 
    }
    #declare iSphere = iSphere + 1;
  #end
  texture { 
    #local _tex = floor(rand(RndSeed) * 10.0);
    #switch (_tex)
    #case (0) T_Stone1 #break
    #case (1) T_Stone2 #break
    #case (2) T_Stone3 #break
    #case (3) T_Stone4 #break
    #case (4) T_Stone5 #break
    #case (5) T_Stone6 #break
    #case (6) T_Stone7 #break
    #case (7) T_Stone8 #break
    #case (8) T_Stone9 #break
    #case (9) T_Stone10 #break
    #else
      _texNeutral 
    #end
    translate 10.0 * rand(RndSeed)
  }
}

object {
  _stone
}
