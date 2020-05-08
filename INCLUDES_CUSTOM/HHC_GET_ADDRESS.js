function HHC_GET_ADDRESS() 
{
	try{

		renameFullAddress();

			}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_GET_ADDRESS:  " + err.message);
			logDebug(err.stack);
		}
}
