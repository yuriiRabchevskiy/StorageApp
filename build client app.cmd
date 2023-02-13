cd %1
RMDIR "backend\Storage\Storage\wwwroot" /S /Q

node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --configuration production ---progress true

robocopy dist backend\Storage\Storage\wwwroot /S /PURGE /XD .svn /XF *.scss  *.cs *.pdb *.map *.user *.csproj /NFL /NJH /NP 
IF %ERRORLEVEL% LSS 8 goto finish
goto :eof
:finish
echo All Done.
exit /b 0