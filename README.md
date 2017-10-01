# Simple boilerplate based on CRA


## Versions 
- React scripts version : 1.0.14
- React 16
- Wepback 3.5.1


## Webpack

__Alias__ : 
- src/components
- src/data
- src/views


## Typescript


Compiler watch `yarn run tsc-w`

__Alias__ : 
- src/components
- src/data
- src/views


## NOTES :

#### Using aliases

Webpack aliases are put in the `config/alias.js` file whereas typescript ones
are in the `tsconfig.json` file. You need to update __both__ in order for them
to work correctly

#### Using ENV vars

Please refer to the `CRA.md` for details. tl;dr : create an `.env` file and
prefix your vars with `REACT_APP_` for them to be injected in the application
