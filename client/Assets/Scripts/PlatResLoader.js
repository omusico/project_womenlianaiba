#pragma strict

/******************************************************************************
add tencent platform resource loader class
******************************************************************************/
//@remark.	adjust interface	Last edit by fullzhu(2012.3.19)
//@remark.
//@remark.
//@remark.
enum IMAGE_TYPE {
	IMGTYPE_NONE = 0,				//invalid
	IMGTYPE_MINI = 1,				//30*30
	IMGTYPE_SMALL = 2,				//45*45
	IMGTYPE_NORMAL = 3,				//60*60
	IMGTYPE_BIG = 4,				//100*100
}
class PlatResInfoCtrl {
	public var account : String;
	public var imageType : IMAGE_TYPE = IMAGE_TYPE.IMGTYPE_NONE;
	
	public var info : player_basic_information;
	public var image : Texture;
	public var URLValid : boolean;

	//overwrite callback function
	public function Callback() {
	}
}

class PlatResLoader
{
	private var mCallbackParamNew : PlatResInfoCtrl;
	private var mOpenID : String;
	private var mCallbackEnable : boolean = false;
	private var www : WWW;
	private var mAppType : PlatType;
	private var mRelocation : boolean = false;
	
	function PlatResLoader(appType : PlatType) {
		mAppType = appType;
	}
	
	public function Update() {
		if(!mCallbackEnable && www) {
			if(www.isDone == true) {
				if(www.error == null) {
					if(mRelocation) {
						CallbackRelocation(www.text);
						return ;
					} else {
						mCallbackParamNew.image = www.texture;
						mCallbackParamNew.URLValid = true;
					}
				} else {
					Debug.Log(www.error);
					mCallbackParamNew.URLValid = false;
				}
				if(mCallbackParamNew && mCallbackParamNew.Callback != null) {
					mCallbackParamNew.Callback();
				}
				
				mCallbackEnable = true;
			} 
		}
	}
	
	public function NetLoadImageUrl(url : String, ctrl : PlatResInfoCtrl) {
		mCallbackParamNew = ctrl;
		
		www = new WWW(url);
	}
	
	public function NetLoadImageOpenIDNew(openID : String, ctrl : PlatResInfoCtrl) {
		mCallbackParamNew = ctrl;
		mOpenID = openID;
		
		//Debug.Log(openID);
		
		var platResMgr : PlatformResMgr = ResManager.platformResMgr;
		var idArray : Array = new Array();
		idArray.Add(openID);
		platResMgr.GetUserInfo(CallbackPlatformResNew,idArray);
	}
	
	public function Cancel() {
		if(www) {
			www.Dispose();
			www = null;
		}
		mCallbackEnable = false;
	}
	
	public function IsFinish() : boolean {
		return mCallbackEnable;
	}
	
	//callback
	private function CallbackPlatformResNew(data:Hashtable) {
		var info : player_basic_information = data[mOpenID] as player_basic_information;
		if(!info) return ;
		
		mCallbackParamNew.account = mOpenID;
		mCallbackParamNew.info = info;
		
		var url : String = info.imageurl;
//		var url : String = "http://image.open.yy.com/avatarurl/266476982";
		
		if(mAppType == PlatType.PT_YY) {
			mRelocation = true;
		} else {
			if(mCallbackParamNew.imageType != IMAGE_TYPE.IMGTYPE_NONE) {
				var size : String = "/60";
				if(mAppType == PlatType.PT_QZONE) {
					size = "/50";
				}else if(mAppType == PlatType.PT_TAPP) {
					size = "/40";
				}
				
				if(mCallbackParamNew.imageType == IMAGE_TYPE.IMGTYPE_MINI) {
					url = url.Replace(size,"/30");
				} else if(mCallbackParamNew.imageType == IMAGE_TYPE.IMGTYPE_SMALL) {
					url = url.Replace(size,"/45");
				} else if(mCallbackParamNew.imageType == IMAGE_TYPE.IMGTYPE_BIG) {
					url = url.Replace(size,"/100");
				}
			}
		}
		
		if(url == "") {
			mCallbackParamNew.URLValid = false;
			mCallbackParamNew.Callback();
			mCallbackEnable = true;
		} else {
			www = new WWW(url);
		}
	}
	
	private function CallbackRelocation(url : String) {
		mRelocation = false;
		
		if(url == "") return ;
		www = new WWW(url);
	}
	
	//data operate
	public function GetCallbackParm() : PlatResInfoCtrl {
		return mCallbackParamNew;
	}
	
}