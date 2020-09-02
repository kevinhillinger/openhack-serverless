#!/bin/bash

rm -rf ./dist

# for func in $(find ./dist/**/function.json); 
# do
#     func_dir=$(dirname $func)
#     rm -rf $func_dir
# done

# rm -rf ./dist/tmp

tsc --build

cp ./package.json ./dist/

echo "functions files: "
echo " - { host.json, settings.json }"
cp ./src/functions/{host.json,local.settings.json} ./dist/

for func_dir in $(ls -d1 ./src/functions/*/); 
do
    dir_name=$(basename $func_dir)
    echo " - $dir_name/function.json"
    cp ./src/functions/$dir_name/function.json ./dist/functions/$dir_name/
done

for func_dir in $(ls -d1 ./dist/functions/*/); 
do
    dir_name=$(basename $func_dir)
    mv -f ./dist/functions/$dir_name ./dist/
done

rm -r ./dist/functions

echo ""