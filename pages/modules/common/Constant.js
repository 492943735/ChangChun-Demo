Constant = {};

Constant.playBackRuning = false;

Constant.USER_QUERY_TEMPLATE_ID = "c077e49a-b8f1-4c63-90fc-39fec1bc037d";
Constant.APP_QUERY_TEMPLATE_ID = "c47363f1-95fe-4791-a582-a38dd7da6875";
Constant.QUALITY_QUERY_TEMPLATE_ID = "6e5a1834-2a92-47a0-96a5-c8260cefaa9c";

/**
 * 制式选中尾缀类型
 */
Constant.All = "all";
Constant.Partial = "partial";
Constant.None = "none";


/**
 * 地图类型
 */
Constant.GOOGLE_TYPE = "GOOGLE_MAP";
Constant.OSM_TYPE = "OSM_TYPE";
Constant.OFFLINE_TYPE = "OFFLINE_MAP";


/**
 * 控制台APP标签组最多显示6个
 */
Constant.MAX_APP_LABEL_SHOW = 6;

/**
 * 用户数指标id
 */
Constant.SUBS_NUM = "HDI_METADATA_GRP_SUBS_NUM";

/**
 * 流量ID
 */
Constant.TRAFFIC = "HDI_METADATA_GRP_NETWORK_TRAFFIC";

/**
 * 流量UNIT
 */
Constant.TRAFFIC_UNIT = "trafficUnit";

/*---------------------------KQI------------------------------*/
/**
 * RSRP
 */
Constant.LABEL_RSRP = "RSRP";
/**
 * RSRQ
 */
Constant.LABEL_RSRQ = "HDI_METADATA_GRP_RSRQ";

/**
 * 下行RTT时延
 */
Constant.LABEL_DOWNLINK_RTT_DELAY = "HDI_METADATA_GRP_DOWNLINK_RTT_DELAY";

/**
 * 视频下载速率
 */
Constant.LABEL_VIDEO_DOWNLOAD_THROUGHPUT = "HDI_METADATA_GRP_VIDEO_DOWNLOAD_THROUGHPUT";

/**
 * VoLTE掉话率
 */
Constant.LABEL_VOLTE_CALL_DROP_RATE = "HDI_METADATA_GRP_VOLTE_CALL_DROP_RATE";

/**
 * VoLTE接通时延
 */
Constant.LABEL_VOLTE_CONNECTION_DELAY = "HDI_METADATA_GRP_VOLTE_CONNECTION_DELAY";

/**
 * VoLTE MOS
 */
Constant.LABEL_VOLTE_MOS = "HDI_METADATA_GRP_VOLTE_MOS";

/**
 * VoLTE话务量
 */
Constant.LABEL_VOLTE_TRAFFIC = "HDI_METADATA_GRP_VOLTE_TRAFFIC";

/**
 * VoLTE接通率
 */
Constant.LABEL_VOLTE_CONNECTION_RATE = "HDI_METADATA_GRP_VOLTE_CONNECTION_RATE";

/**
 * 下载速率
 */
Constant.LABEL_DOWNLOAD_THROUGHPUT = "Download Throughput";
/**
 * PRB利用率
 */
Constant.LABEL_PRB_UTILIZATION = "PRB Utilization";
/**
 * 下行丢包率
 */
Constant.LABEL_DOWNlINK_LOSS_PACKAGE_RATE = "HDI_METADATA_GRP_DOWNLINK_LOSS_PACKET_RATE";

/**
 * 上行丢包率
 */
Constant.LABEL_UPlINK_LOSS_PACKAGE_RATE = "HDI_METADATA_GRP_UPLINK_LOSS_PACKET_RATE";

/**
 * eSRVCC切换成功率
 */
Constant.LABEL_ESRVCC_HO_AFTER_ANSWER_SUCCESS_RATE = "HDI_METADATA_GRP_ESRVCC_HO_RATE";

/**
 * 页面显示时长
 */
Constant.LABEL_PAGE_BROWSING_DELAY = "HDI_METADATA_GRP_PAGE_BROWSING_DELAY";

/**
 * 页面显示成功率
 */
Constant.LABEL_PAGE_BROWSING_SUCCESS_RATE = "HDI_METADATA_GRP_PAGE_BROWSING_SUCCESS_RATE";

/**
 * 页面下载速率
 */
Constant.LABEL_PAGE_DOWNLOAD_THROUGHPUT = "HDI_METADATA_GRP_PAGE_DOWNLOAD_THROUGHPUT";

/**
 * 页面响应时长
 */
Constant.LABEL_PAGE_RESPONSE_DELAY = "HDI_METADATA_GRP_PAGE_RESPONSE_DELAY";

/**
 * 页面响应成功率
 */
Constant.LABEL_PAGE_RESPONSE_SUCCESS_RATE = "HDI_METADATA_GRP_PAGE_RESPONSE_SUCCESS_RATE";

/**
 * 视频流媒体下载速率
 */
Constant.LABEL_VIDEO_STREAMING_DOWNLOAD_THROUGHPUT = "HDI_METADATA_GRP_STREAM_DW_THROUGHPUT";

/**
 * 视频流媒体初始播放成功率
 */
Constant.LABEL_VIDEO_STREAMING_START_SUCCESS_RATE = "HDI_METADATA_GRP_STREAM_START_SUC_RATE";

/**
 * 视频流媒体初始缓存时延
 */
Constant.LABEL_VIDEO_STREAMING_START_DELAY = "HDI_METADATA_GRP_STREAM_START_DELAY";

Constant.KQI_NAME_TO_ID={
	"RSRP" : Constant.LABEL_RSRP,
    "RSRQ" : Constant.LABEL_RSRQ,
    "Download Throughput" : Constant.LABEL_DOWNLOAD_THROUGHPUT,
    "Video Download Throughput" : Constant.LABEL_VIDEO_DOWNLOAD_THROUGHPUT,
    "Downlink RTT Delay" : Constant.LABEL_DOWNLINK_RTT_DELAY,
    "PRB Utilization" : Constant.LABEL_PRB_UTILIZATION,
    "Uplink Loss Packet Rate" : Constant.LABEL_UPlINK_LOSS_PACKAGE_RATE,
    "VoLTE MO Connection Rate" : Constant.LABEL_VOLTE_CONNECTION_RATE,
    "V2ALL MO Connection Delay" : Constant.LABEL_VOLTE_CONNECTION_DELAY,
    "VoLTE Call Drop Rate" : Constant.LABEL_VOLTE_CALL_DROP_RATE,
    "V2ALL Voice DL MOS" : Constant.LABEL_VOLTE_MOS,
    "VoLTE Connection Traffic" : Constant.LABEL_VOLTE_TRAFFIC,
    "Downlink Loss Packet Rate" : Constant.LABEL_DOWNlINK_LOSS_PACKAGE_RATE,
    "eSRVCC HO after Answer Success Rate" : Constant.LABEL_ESRVCC_HO_AFTER_ANSWER_SUCCESS_RATE,
    "Page Browsing Delay" : Constant.LABEL_PAGE_BROWSING_DELAY,
    "Page Browsing Success Rate" : Constant.LABEL_PAGE_BROWSING_SUCCESS_RATE,
    "Page Download Throughput" : Constant.LABEL_PAGE_DOWNLOAD_THROUGHPUT,
    "Page Response Delay" : Constant.LABEL_PAGE_RESPONSE_DELAY,
    "Page Response Success Rate" : Constant.LABEL_PAGE_RESPONSE_SUCCESS_RATE,
    "Video Streaming Download Throughput" : Constant.LABEL_VIDEO_STREAMING_DOWNLOAD_THROUGHPUT,
    "Video Streaming Start Success Rate" : Constant.LABEL_VIDEO_STREAMING_START_SUCCESS_RATE,
    "Video Streaming Start Delay" : Constant.LABEL_VIDEO_STREAMING_START_DELAY
};

/**
 * vvip用户组Id
 */
Constant.VVIP_GROUP_CATID = 1;
Constant.VVIP_GROUP = "VVIP Group"
/**
 * High/Low Value
 */
Constant.HIGH_LOW_VALUE_CATID = 2;
Constant.HIGHVALUE_ID = 2;
Constant.LOWVALUE_ID = 3;
Constant.HIGH_VALUE = "High Value";
Constant.LOW_VALUE = "Low Value";
Constant.TOTAL_TRAFFIC = "Total Traffic";
/*---------------------------APP------------------------------*/
Constant.LABEL_YouTube = "HDI_METADATA_GRP_NETWORK_TRAFFIC_342";
Constant.LABEL_Instagram = "HDI_METADATA_GRP_NETWORK_TRAFFIC_1181";
Constant.LABEL_Facebook = "HDI_METADATA_GRP_NETWORK_TRAFFIC_829";
Constant.LABEL_Twitter = "HDI_METADATA_GRP_NETWORK_TRAFFIC_973";
Constant.LABEL_WhatsApp = "HDI_METADATA_GRP_NETWORK_TRAFFIC_859";
Constant.LABEL_SnapChat = "HDI_METADATA_GRP_NETWORK_TRAFFIC_1428";

/*---------------------------USER------------------------------*/

/*---------------------------KEY_EVENT------------------------------*/
Constant.EVENT_TYPE_MOUSE_DOWN = 0;
Constant.EVENT_TYPE_MOUSE_UP = 1;
Constant.EVENT_TYPE_MOUSE_LEAVE = 2;
Constant.LOCATION = "location";
Constant.LOCKSCREEN = "lockScreen";
Constant.DOUBLEWIN = "doubleWin";
Constant.BANDWIDTH = "bandWidth";
Constant.THRESHOLD = "Threshold";
Constant.PREVIEW = "preview";
Constant.SAVE = "save";
Constant.MAPZOOMDECREASE = "mapZoomDecrease";
Constant.MAPZOOMINCREASE = "mapZoomIncrease";
/*---------------------------TYPE------------------------------*/
USERTYPE = [
	"产品（who）",
	"使用（how）",
	"偏好（what else）",
	"性别（sex）",
	"地域（district）",
	"年龄（age）",
	"职业（job）",
	"????(????)",
	"???(???)",
	"??(??)"
];
USERSHOW = [false,false,false,false,false,false,false,false,false,false];
/**
 * 国际化常量key
 */
I18N_KEY = {
	DIY: "DIY"
};

/**
 * 标签类型枚举
 */
LabelType = {
	USER: "user",
	APP: "app",
	KQI: "quality"
};

/**
 * 图片常量key
 */
IMAGES = {
	ThresholdBtn : "btnBg.png",
	ThredsholdBackground : "thredsholdbackground.png",
	ThresholdBtnActive : "btnBgActive.png",
	IconVvipArrowLight : "icon_vvip_arrow_light.png",
	Threshold: "Threshold.png",
	ThresholdAddBtn:"ThresholdAddBtn.png",
	ThresholdMinusBtn:"ThresholdMinusBtn.png",
	ThresholdLight: "Threshold-light.png",
	ThresholdSetUpBtn: "Threshold_setUp_btn.png",
	frequency: "frequency.png",
	frequencyLight: "frequency-light.png",
	doubleScreenLeft: "1screen_left.png",
	doubleScreenClose: "2screen.png",
	doubleScreenClosePress: "2screen-light.png",
	doubleScreenLeftPress: "1screen_left-light.png",
	doubleScreenLeft: "1screen_left.png",
	doubleScreenRightPress: "1screen_right-light.png",
	doubleScreenRight: "1screen_right.png",
	lockScreen: "lock_screen.png",
	openLockScreen: "openlock_screen.png",
	lockScreenLight: "lock_screen-light.png",
	openLockScreenLight: "openlock_screen-light.png",
	zoomIn: "zoom_in.png",
	zoomInLight: "zoom_in-light.png",
	zoomOut: "zoom_out.png",
	zoomOutLight: "zoom_out-light.png",
	topBg: "topBg.png",
	topDeriveIcon: "topDeriveIcon.png",
	topDeriveIcon_dark: "topDeriveIcon_dark.png",
	topDrawIcon: "topDrawIcon.png",
	topDrawIcon_dark: "topDrawIcon_dark.png",
	topRefreshIcon: "topRefreshIcon.png",
	topRefreshIcon_dark: "topRefreshIcon_dark.png",
	topSettingIcon: "topSettingIcon.png",
	topSettingIcon_dark: "topSettingIcon_dark.png",
	topSaveIcon: "topSaveIcon.png",
	topSaveIcon_dark: "topSaveIcon_dark.png",
	excel: "ic_file_xls.png",
	csv: "ic_file_csv.png",
	polygonDraw: "polygonDraw.png",
	polygonRemove: "polygonRemove.png",
	polygonShow: "polygonShow.png",
	guangbiao: "guangbiao.png",
	topTipBg: "topTipBg.png",
	rightFloatLabelLine: "rightFloatLabelLine.png",
	rightFloatLabelLine_short: "rightFloatLabelLine_short.png",
	rightFloatLabel_user: "rightFloatLabel_user.png",
	rightFloatLabel_userActive: "rightFloatLabel_userActive.png",
	rightFloatLabel_app: "rightFloatLabel_app.png",
	rightFloatLabel_appActive: "rightFloatLabel_appActive.png",
	rightFloatLabel_kqi: "rightFloatLabel_kqi.png",
	rightFloatLabel_kqiActive: "rightFloatLabel_kqiActive.png",
	rightFloatLabel_line: "rightFloatLabel_line.png",
	frequency_selection_window: "frequency_selection_window",
	frequency_selection_window_arrow: "frequency_selection_window_arrow",
	btnBg_plus: "btnBg_plus.png",
	btnBgActive: "btnBgActive.png",
	btnBg: "btnBg.png",
	workBench_tabSelected: "workBench_tabSelected.png",
	workBench_trapezoid: "workBench_trapezoid.png",
	workBench_trapezoid_left: "workBench_trapezoid_left.png",
	workBench_trapezoid_right: "workBench_trapezoid_right.png",
	workBench_timeHideBar: "workBench_timeHideBar.png",
	workBench_timeShowBar: "workBench_timeShowBar.png",
	workBench_timeBg: "workBench_timeBg.png",
	workBench_timeBefore: "workBench_timeBefore.png",
	workBench_timeNext: "workBench_timeNext.png",
	workBench_playBack_start: "workBench_playBack_start.png",
	workBench_playBack_pause: "workBench_playBack_pause.png",
	workBench_playBack_stop: "workBench_playBack_stop.png",
	workBench_trapezoid_hideIcon: "workBench_trapezoid_hideIcon.png",
	workBench_trapezoid_showIcon: "workBench_trapezoid_showIcon.png",
	workBench_left_arrow:"left_arrow.png",
	workBench_right_arrow:"right_arrow.png",
	workBench_left_arrow_light:"left_arrow_light.png",
	workBench_right_arrow_light:"right_arrow_light.png",
	workbench_how:"workbench_how.png",
	workbench_who:"workbench_who.png",
	workbench_whatelse:"workbench_whatelse.png",
	workBench_daytime:'daytime.png',
	workBench_daytime_light:'daytime_light.png',
	workBench_night:'night.png',
	workBench_night_light:'night_light.png',
	workbench_working_day:"working_day.png",
	workbench_working_day_light:"working_day_light.png",
	workBench_nonworking_day:'nonworking_day.png',
	workBench_nonworking_day_light:'nonworking_day_light.png',
	label_roaming: "label_roaming.png",
	label_volteUser: "label_volteUser.png",
	label_volte_connection_delay: "label_volte_connection_delay.png",
	label_volte_call_drop_rate: "label_volte_call_drop_rate.png",
	label_volte_connection_success_rate: "label_volte_connection_success_rate.png",
	label_volte_mos: "label_volte_mos.png",
	label_youtube: "label_youtube.png",
	label_wifirouter: "label_wifirouter.png",
	label_web_dw_speed: "label_web_dw_speed.png",
	label_vvip: "label_vvip.png",
	label_volteUser: "label_volteUser.png",
	label_volte_flow: "label_volte_flow.png",
	label_vip: "label_vip.png",
	label_video_dw_speed: "label_video_dw_speed.png",
	label_user_default: "label_user_default.png",
	label_ullost: "label_ullost.png",
	label_silver: "label_silver.png",
	label_package: "label_package.png",
	label_gold: "label_gold.png",
	label_bronze: "label_bronze.png",
	label_high_value: "label_high_value.png",
	label_dllost: "label_dllost.png",
	label_low_value: "label_low_value.png",
	label_diamond: "label_diamond.png",
	label_download_speed: "label_download_speed.png",
	label_group: "label_group.png",
	label_avg: "label_avg.png",
	label_index_default: "label_index_default.png",
	label_complaint: "label_complaint.png",
	label_allUser: "label_allUser.png",
	label_smartPhone: "label_smartPhone.png",
	label_twitter: "label_twitter.png",
	label_facebook: "label_facebook.png",
	label_whatsapp: "label_whatsapp.png",
	label_snapchat: "label_snapchat.png",
	label_instagram: "label_instagram.png",
	label_psVolume: "label_psVolume.png",
	label_prb: "label_prb.png",
	label_rsrp: "label_rsrp.png",
	label_rsrq: "label_rsrq.png",
	label_downlink_rtt_delay: "label_downlink_rtt_delay.png",
	label_volte_traffic: "label_volte_traffic.png",
	label_esrvcc_ho_after_answer_success_rate: "label_esrvcc_ho_after_answer_success_rate.png",
	label_page_browsing_delay: "label_page_browsing_delay.png",
	label_page_browsing_success_rate: "label_page_browsing_success_rate.png",
	label_page_download_throughput: "label_page_download_throughput.png",
	label_page_response_delay: "label_page_response_delay.png",
	label_page_response_success_rate: "label_page_response_success_rate.png",
	label_video_streaming_download_throughput: "label_video_streaming_download_throughput.png",
	label_video_streaming_start_success_rate: "label_video_streaming_start_success_rate.png",
	label_video_streaming_start_delay: "label_video_streaming_start_delay.png",
	rightLabelLine_btn:'rightLabelLine_btn.png',
	rightLabelLine_light_btn:'rightLabelLine_light_btn.png',
	earth: "earth.png",
	mapborder: "gzt-mapborder.png",
	jian_icon: "hide_panel.png",
	jia_icon: "open_panel.png",
	picktime_before: "picktime_before.png",
	picktime_next: "picktime_next.png",
	delate_mini: "delate_mini.png",
	checkbox: "checkbox.png",
	checked: "checked.png",
	cellWindowBg: "cellWindowBg.png",
	bg_popup: "bg_popup.png",
	bg_popup_title: "bg_popup_title.png",
	bg_popup: "bg_popup.png",
	bg_popup_title: "bg_popup_title.png",
	day_selected: "day_selected.png",
	rightFloatLabelLine_dark: "rightFloatLabelLine_dark.png",
	rightFloatLabel: "rightFloatLabel.png",
	rightFloatLabel_active: "rightFloatLabel_Active.png",
	bg_setting_edit: "bg_setting_edit.png",
	bg_setting_edit_title: "bg_setting_edit_title.png",
	ic_image_edit: "ic_image_edit.png",
	rightFloatLabel_active: "rightFloatLabel_Active.png",
	vvipIcon: "icon_vvip_arrow_light.png",
	openStory: "openStory.png",
	openStory_light: "openStory_light.png",
	ic_warning: "ic_warning.png",
	scenario_bg: "scenario_bg.png",
	onlyDelete: "onlyDelete.png",
	rightLabel_bg: "rightLabel_bg.png",
	rightLabel_bg_light: "rightLabel_bg_light.png",
	ic_colse: "ic_colse.png",
	btn_time_control: "btn_time_control.png",
	ic_up_time_control: "ic_up_time_control.png",
	ic_down_time_control: "ic_down_time_control.png",
	tableAuIcon : "tableAuIcon.png",
    tableAuIcon_dark:"tableAuIcon_dark.png",
    ic_locationMark: "ic_locationMark.png",
    locationOff: "locationOff.png",
    locationOn: "locationOn.png",
    openStory: "ic_open_template.png",
    saveStory: "ic_save_template.png",
    seach_dark:"search_dark.png",
    seach:"search.png",
    menuTop_dark:"menuTop_dark.png",
    menuTop:"menuTop.png",
    brush_dark:"brush_dark.png",
    brush:"brush.png",
};

//图片路径map
var imgLightBasePath = requestContext + "/pages/images/imageLight/";
IMAGE_PATH = {};
/*--------------KQI default logo----------------*/
//RSRP
IMAGE_PATH[Constant.LABEL_RSRP] = imgLightBasePath + IMAGES.label_rsrp;
//RSRQ
IMAGE_PATH[Constant.LABEL_RSRQ] = imgLightBasePath + IMAGES.label_rsrq;
//下行RTT时延
IMAGE_PATH[Constant.LABEL_DOWNLINK_RTT_DELAY] = imgLightBasePath + IMAGES.label_downlink_rtt_delay;
//视频下载速率
IMAGE_PATH[Constant.LABEL_VIDEO_DOWNLOAD_THROUGHPUT] = imgLightBasePath + IMAGES.label_video_dw_speed;
//VoLTE掉话率
IMAGE_PATH[Constant.LABEL_VOLTE_CALL_DROP_RATE] = imgLightBasePath + IMAGES.label_volte_call_drop_rate;
//VoLTE接通时延
IMAGE_PATH[Constant.LABEL_VOLTE_CONNECTION_DELAY] = imgLightBasePath + IMAGES.label_volte_connection_delay;
//VoLTE MOS
IMAGE_PATH[Constant.LABEL_VOLTE_MOS] = imgLightBasePath + IMAGES.label_volte_mos;
//VoLTE话务量
IMAGE_PATH[Constant.LABEL_VOLTE_TRAFFIC] = imgLightBasePath + IMAGES.label_volte_traffic;
//VoLTE接通率
IMAGE_PATH[Constant.LABEL_VOLTE_CONNECTION_RATE] = imgLightBasePath + IMAGES.label_volte_connection_success_rate;
//下载速率
IMAGE_PATH[Constant.LABEL_DOWNLOAD_THROUGHPUT] = imgLightBasePath + IMAGES.label_download_speed;
//PRB利用率
IMAGE_PATH[Constant.LABEL_PRB_UTILIZATION] = imgLightBasePath + IMAGES.label_prb;
//下行丢包率
IMAGE_PATH[Constant.LABEL_DOWNlINK_LOSS_PACKAGE_RATE] = imgLightBasePath + IMAGES.label_dllost;
//上行丢包率
IMAGE_PATH[Constant.LABEL_UPlINK_LOSS_PACKAGE_RATE] = imgLightBasePath + IMAGES.label_ullost;
//eSRVCC切换成功率
IMAGE_PATH[Constant.LABEL_ESRVCC_HO_AFTER_ANSWER_SUCCESS_RATE] = imgLightBasePath + IMAGES.label_esrvcc_ho_after_answer_success_rate;
//页面显示时长
IMAGE_PATH[Constant.LABEL_PAGE_BROWSING_DELAY] = imgLightBasePath + IMAGES.label_page_browsing_delay;
//页面显示成功率
IMAGE_PATH[Constant.LABEL_PAGE_BROWSING_SUCCESS_RATE] = imgLightBasePath + IMAGES.label_page_browsing_success_rate;
//页面下载速率
IMAGE_PATH[Constant.LABEL_PAGE_DOWNLOAD_THROUGHPUT] = imgLightBasePath + IMAGES.label_page_download_throughput;
//页面响应时长
IMAGE_PATH[Constant.LABEL_PAGE_RESPONSE_DELAY] = imgLightBasePath + IMAGES.label_page_response_delay;
//页面响应成功率
IMAGE_PATH[Constant.LABEL_PAGE_RESPONSE_SUCCESS_RATE] = imgLightBasePath + IMAGES.label_page_response_success_rate;
//视频流媒体下载速率
IMAGE_PATH[Constant.LABEL_VIDEO_STREAMING_DOWNLOAD_THROUGHPUT] = imgLightBasePath + IMAGES.label_video_streaming_download_throughput;
//视频流媒体初始播放成功率
IMAGE_PATH[Constant.LABEL_VIDEO_STREAMING_START_SUCCESS_RATE] = imgLightBasePath + IMAGES.label_video_streaming_start_success_rate;
//视频流媒体初始缓存时延
IMAGE_PATH[Constant.LABEL_VIDEO_STREAMING_START_DELAY] = imgLightBasePath + IMAGES.label_video_streaming_start_delay;
/*--------------APP default logo----------------*/
IMAGE_PATH[Constant.LABEL_YouTube] = imgLightBasePath + IMAGES.label_youtube;
IMAGE_PATH[Constant.LABEL_Instagram] = imgLightBasePath + IMAGES.label_instagram;
IMAGE_PATH[Constant.LABEL_Facebook] = imgLightBasePath + IMAGES.label_facebook;
IMAGE_PATH[Constant.LABEL_Twitter] = imgLightBasePath + IMAGES.label_twitter;
IMAGE_PATH[Constant.LABEL_WhatsApp] = imgLightBasePath + IMAGES.label_whatsapp;
IMAGE_PATH[Constant.LABEL_SnapChat] = imgLightBasePath + IMAGES.label_snapchat;
/*--------------USER default logo----------------*/
IMAGE_PATH["All Users"] = imgLightBasePath + IMAGES.label_allUser;
IMAGE_PATH["WifiRouter"] = imgLightBasePath + IMAGES.label_wifirouter;
IMAGE_PATH["SmartPhone"] = imgLightBasePath + IMAGES.label_smartPhone;
IMAGE_PATH["Roaming"] = imgLightBasePath + IMAGES.label_roaming;
IMAGE_PATH["VoLTE"] = imgLightBasePath + IMAGES.label_volteUser;
IMAGE_PATH[Constant.VVIP_GROUP] = imgLightBasePath + IMAGES.label_vvip;
IMAGE_PATH[Constant.HIGH_VALUE] = imgLightBasePath + IMAGES.label_high_value;
IMAGE_PATH[Constant.LOW_VALUE] = imgLightBasePath + IMAGES.label_low_value;

