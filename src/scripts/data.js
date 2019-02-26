var ajax = require('./post');
var utils = require('./utils');
var config = require("../config/config.json");
var Data = {};
Data.STATE = {
	'NEW': 'new',
	'DELETE': 'delete',
	'EDIT': 'edit',
	'NONE': 'none'
};
var data_base = function(id, config) {
		var _this = this; 
		var _class = null;
		var message = "data-bind-" + id;
		var identifer = config.identifer || "id";
		var _version = "version";
		var _id = id;
		var _saveAction = config.saveAction;
		var _newAction = config.newAction;
		var _queryAction = config.queryAction;

		var _fk = config.fk; 
		var _fData = {}; 

		var _data = {}; 
		var _rowidIndex = [];
		var _dataNew = {};
		var _onAfterSave = config.onAfterSave;
		var _onLoaded = config.onLoaded;
		var _onSelectRow = config.onSelectRow;
		var _onValueChanged = config.onValueChanged;

		var _crrentID = null; 
		var _dataKey = null;
		var _dataVersion = -1;
		var _FreshKey = -1;
		var _bindPlugIn = [];

		this.bindPlugIn = function(plugInThis) {
			for (var index in _bindPlugIn) {
				if (_bindPlugIn[index] == plugInThis) return;
			}
		}
		var _dataDelete = [];
		var _dataEdite = {}; 
		var _onAfterNew = config.onAfterNew;
		var _onAfterDelete = config.onAfterDelete;
		var _onAfterSave = config.onAfterSave;
		var _onLoaded = config.onLoaded;
		var _onSelectRow = config.onSelectRow;
		var _onValueChanged = config.onValueChanged;

		var _crrentID = null; 
		var _dataKey = null;
		var _dataVersion = -1;
		var _FreshKey = -1;
		var _bindPlugIn = [];

		this.bindPlugIn = function(plugInThis) {
			for (var index in _bindPlugIn) {
				if (_bindPlugIn[index] == plugInThis) return;
			}
			_bindPlugIn.push(plugInThis);
		}

		var _setStatus = function(rowid, status) {
				if (!_data[rowid]) {
					_data[rowid] = {};
				}
				_data[rowid]["status"] = status;
			};
		this._changeDataVersion = function() {
			_dataVersion++;
			if (_fk) {
				for (var k in _fk) {
					_fk[k].data._changeDataVersion();
				}
			}
		};
		this._setThis = function(k01) {
			_this = k01;
		};
		this.getDataID = function() {
			return id;
		};
		this._getCoreData = function() {
			return _data;
		}

		this.getCount = function() {
			var j = 0;
			for (var id in _data) {
				if (_data[id].status != "delete") {
					j++;
				}
			}
			return j;
		};
		this.getDataStatus = function(rowid) {
			if (!rowid) {
				utils.print(id + "数据中getDataStatus参数rowid没有值");
				return;
			}
			if (_data[rowid]) {
				return _data[rowid].status;
			}
		};
		this.isChange = function() {
			var changes = _this._getSaveData();
			if (changes[0].length != 0 || changes[1].length != 0 || changes[2].length != 0) {
				return true;
			}
			var p01 = _this._getChidrenThis();
			var p02;
			for (var k in p01) {
				p02 = p01[k];
				if (p02.isChange()) {
					return true;
				}
			}
			return false;
		};
		this._afterSaveSuccess = function(data) {
			var k01 = data[_class];
			if (k01) {
				if (_this.checkThisIsChange() === true) {
					var bVersion = k01.version;
					if ((bVersion === 0 && _dataVersion === 0 || bVersion && bVersion == _dataVersion)) {
						for (var k in _dataNew) {
							_data[k].data = _dataNew[k];
							_setStatus(k, "none");
						}
						_dataNew = {};
						for (var k in _dataEdite) {
							for (var a in _dataEdite[k]) {
								_data[k][a] = _dataEdite[k][a];
							}
							_setStatus(k, "none");
						}
						_dataEdite = {};
						for (var k in _dataDelete) {
							delete _data[_dataDelete[k]];
							for (var a in _rowidIndex) {
								if (_rowidIndex[a] == k) {
									_rowidIndex.splice(a, 1);
									break;
								}
							}
						}
						_dataDelete = [];
					} else {
						throw "none";
					}
				}
			}
			var p = _this._getChidrenThis();
			for (var i in p) {
				p[i]._afterSaveSuccess(data);
			}
		};
		var _pointData = {};

		this.setPoint = function() {
			_pointData["currentID"] = _this.getCurrentID();
			_pointData["_data"] = JSON.stringify(_data);
			_pointData["_rowidIndex"] = JSON.stringify(_rowidIndex);
			_pointData["_dataNew"] = JSON.stringify(_dataNew);
			_pointData["_dataDelete"] = JSON.stringify(_dataDelete);
			_pointData["_dataEdite"] = JSON.stringify(_dataEdite);
			for (var p in _fData) {
				_fData[p].setPoint();
			}
		};
		this.removePoint = function() {
			_pointData = {};
			for (var p in _fData) {
				_fData[p].removePoint();
			}
		};

		this.back = function() {
			var p = eval("(" + _pointData._data + ")"); 
			for (var i in _data) {
				delete _data[i];
			}
			for (var p1 in p) {
				_data[p1] = p[p1];
			}

			p = eval("(" + _pointData._rowidIndex + ")");
			_rowidIndex.splice(0, _rowidIndex.length);
			for (var i in p) {
				_rowidIndex.push(p[i]);
			}

			p = eval("(" + _pointData._dataNew + ")");
			for (var i in _dataNew) {
				delete _dataNew[i];
			}
			for (var p1 in p) {
				_dataNew[p1] = p[p1];
			}

			p = eval("(" + _pointData._dataDelete + ")");
			_dataDelete.splice(0, _dataDelete.length);
			for (var i in p) {
				_dataDelete.push(p[i]);
			}

			p = eval("(" + _pointData._dataEdite + ")");
			for (var i in _dataEdite) {
				delete _dataEdite[i];
			}
			for (var p1 in p) {
				_dataEdite[p1] = p[p1];
			}

			if (_crrentID != _pointData.currentID) {
				_this.selectRow(_pointData.currentID || -1);
			}
			for (var p in _fData) {
				_fData[p].back();
			}
		};
		this._setChildrenData = function(cData) {
			var cID = cData.getDataID();
			_fData[cID] = cData;
		};

		this.getChildrenData = function(rowid, childrendDataID) {
			if (typeof rowid != "string") rowid = _crrentID;
			if (!rowid) {
				utils.print("getChildrenData没有焦点数据行");
				return;
			}
			var p1, cID, p2;
			var re = new Array();
			var cData;
			if (childrendDataID) {
				cData = _fData[childrendDataID];
				if (cData) {
					re = re.concat(cData.getDatas("@." + cData._getFKey(_this) + "=='" + rowid + "'"));
				}
			} else {
				for (var i in _fData) {
					cData = _fData[i];
					re = re.concat(cData.getDatas("@." + cData._getFKey(_this) + "=='" + rowid + "'"));
				}
			}
			return re;
		};
		var cloneBean = function(data) {
				var re = {};
				for (var i in data) {
					re[i] = data[i];
				}
				return re;
			};
		var _filterReg = /={2,3}/;
	
		this.getDatas = function(filter) {
			if (filter && filter.indexOf("=") > -1 && !filter.match(_filterReg)) {
				utils.print("表达式错误（不能包含=），请检查！");
				return;
			}
			var re = new Array();
			var status;
			var dataEdite, localData;
			for (var p in _data) {
				status = _data[p].status;
				if (status == "delete") {
					continue;
				} else if (status == "edit") {
					dataEdite = _dataEdite[p];
					localData = {};
					for (var i in _data[p].data) {
						localData[i] = (dataEdite[i] == 0 || dataEdite[i] == "" || dataEdite[i]) ? dataEdite[i] : _data[p].data[i];
					}
					if (filter == undefined || eval(filter.replace(/@/g, "localData")) === true) {
						re.push(cloneBean(localData));
					}
				} else {
					if (filter == undefined || eval(filter.replace(/@/g, "_data[p].data")) === true) {
						re.push(cloneBean(_data[p]["data"]));
					}
				}
			}
			return re;
		};

		this._getChidrenThis = function() {
			return _fData;
		};
	
		this.getRowIds = function() {
			var rowIds = [];
			for (var id in _data) {
				if (_data[id].status != "delete") {
					rowIds.push(id);
				}
			}
			return rowIds;
		};
		this.getClass = function() {
			return _class;
		};
	
		this.setClass = function(clazz) {
			_class = clazz;
		};

		var _getData = function(_cData, p) {
				var p01 = _cData._getChidrenThis();
				var p02, p03, p04;
				for (var k in p01) {
					p02 = p01[k];
					p03 = p02._getSaveData();
					p04 = p02.getClass();
					if (p03[0].length != 0 || p03[1].length != 0 || p03[2].length != 0) {
						p[p04] = {
							"new": JSON.stringify(p03[0]),
							"modified": JSON.stringify(p03[1]),
							"delete": p03[2].join(";"),
							"version": p03[3]
						};
					}
					_getData(p02, p);
				}
			};
		var parseParam = function(_param) {
				var param = {};
				if (_param) {
					var t01;
					for (var p in _param) {
						t01 = typeof(_param[p]);
						if (t01 == "function") {
							param[p] = _param[p]();
						} else if (t01 == "undefined") {

						} else {
							param[p] = _param[p];
						}
					}
				};
				return param;
			};
		this._endEdit = function() {
			var p01 = _this._getChidrenThis();
			for (var k in p01) {
				p01[k]._endEdit();
			}
		};
		this.save = function(callback) {
			this._endEdit();
			this._save(function() {
				if (_onAfterSave) _onAfterSave(true);
				if (callback) callback(true);
			}, callback);
		};
		this.checkThisIsChange = function() {
			var changes = _this._getSaveData();
			if (changes[0].length != 0 || changes[1].length != 0 || changes[2].length != 0) {
				return true;
			}
			return false;
		};
		this._save = function(localCallback, callback, actionUrl, actionParam) {
			if (!_saveAction || !_saveAction.url) return;
			if (_fk) {
				for (var k in _fk) {
					if (_fk[k].data.checkThisIsChange() !== true) {
						return utils.print("请先保存主表数据！");
					}
				}
			}

			var action = _saveAction.url,param;
			try {
				param = parseParam(_saveAction.param);
			} catch (e) {
				utils.print(_id + "数据的保存参数错误，请检查代码！" + e);
				return;
			}
			if (!_class) {
				utils.print(_id + "数据的保存参数错误，请检查代码！");
				return;
			}
			var p = {};
			for (var index in _bindPlugIn) {
				if (_bindPlugIn[index]._saveBefore) _bindPlugIn[index]._saveBefore(param);
			}
			var changes = _this._getSaveData();

			try {
				if (changes[0].length != 0 || changes[1].length != 0 || changes[2].length != 0) {
					p[_class] = {
						"new": JSON.stringify(changes[0]),
						"modified": JSON.stringify(changes[1]),
						"delete": changes[2].join(";"),
						"version": _dataVersion
					};
				}
				_getData(_this, p);
				var i = 0;
				for (var k in p) {
					i = 1;
					break;
				}
				if (i == 0) {
					return true;
				}
				param["Agilesoft_DataSaveString"] = JSON.stringify(p);
			} catch (e) {
				utils.print(_id + "代码出现异常！" + e);
				return;
			}
			param["Agilesoft_Data"] = true;
			param["Agilesoft_DataKey"] = _dataKey;
			param["Agilesoft_AskType"] = "Agilesoft_IsAskSave";
			param["Agilesoft_DataVersion"] = _dataVersion;
			param["Agilesoft_Data_class"] = _class;
			ajax.post(action, param, function(data, textStatus, msg, resultCode) {
				if (data.status == "SUCCESS") {
					var beanData = eval("(" + data.data.Back_Result_data + ")");
					data.Back_Result_data = beanData;
					for (var index in _bindPlugIn) {
						if (_bindPlugIn[index]._saveAfter) _bindPlugIn[index]._saveAfter(data);
					}
					_this._afterSaveSuccess(beanData);
					localCallback(beanData);
					return;
				} else if (data.status == "FAILURE") {
					switch (resultCode) {
					case 1001:
						if (parseInt(msg, 10) == _dataVersion && _this.checkThisIsChange() === true) {
							utils.print("数据正在保存中，请不要重复提交！");
						}
						return;
					case 1002:
						utils.print("过期数据！");
						return;
					default:
						if (_onAfterSave) {
							_onAfterSave(false, _id + "保存失败:" + msg);
						}
						if (callback) callback(false, msg);
						return;
					}
				} else {
					if (_onAfterSave) _onAfterSave(false, _id + "保存失败:" + msg);
					if (callback) callback(false, msg);
					return;
				}
			});
		}
		this._setFocusChildren = function(cData, cp, clearFlag, total) {
			var cDataID = cData.getDataID();
			var p = _data[_crrentID]["currentChildren"];
			if (!p) {
				p = _data[_crrentID]["currentChildren"] = {};
			}
			if (typeof cp == "string") {
				var p1 = p[cDataID];
				if (!p1 || clearFlag === true) {
					p1 = p[cDataID] = {
						rows: [],
						total: total
					};
				}
				p1.rows.push(cp);
			} else if (cp instanceof Array) {
				var p1 = p[cDataID];
				if (!p1 || clearFlag === true) {
					p1 = p[cDataID] = {
						rows: [],
						total: total
					};
				}
				for (var i in cp) {
					p1.rows.push(cp[i]);
				}
			}
		}

		this.selectRow = function(selectParam) {
			var rowid;
			if (typeof(selectParam) == "number") { 
				rowid = _this.getRowID(selectParam);
			} else if (typeof(selectParam) == "string") {
				rowid = selectParam;
			} else {
				utils.print("data'" + _id + "'的selectRow参数为行索引或者为主键");
				return;
			}
			var k01 = _data[rowid];
			if (!rowid || !k01) {
				_crrentID = undefined;
				for (var index in _bindPlugIn) {
					if (_bindPlugIn[index]._selectRowAfter) _bindPlugIn[index]._selectRowAfter(_crrentID);
				}
				if (typeof _onSelectRow == "function") {
					_onSelectRow();
				}
				for (var p01 in _fData) {
					cData01 = _fData[p01];
					cData01._show();
				}
				return;
			}

			if (!k01 || k01.status == "delete") {
				utils.print("data'" + _id + "'的selectRow选取的行已经删除");
				return;
			}
			var p = _this.getData(rowid);
			_crrentID = rowid;
			if (p) {
				for (var i in p) {
					if (i != _version && i != identifer) {
						//pubSub.trigger(message, [i, p[i], null, p[identifer]]);
					}
				}
			} /*******加载从数据**********/
			var cData01 = null;
			if (k01.status == 'new') {
				var currentChildren = k01.currentChildren;
				if (currentChildren) {
					for (var p01 in _fData) {
						cData01 = _fData[p01];
						cData01._show(currentChildren[cData01.getDataID()]);
					}
				} else {
					for (var p01 in _fData) {
						cData01 = _fData[p01];
						cData01._show();
					}
				}
				for (var index in _bindPlugIn) {
					if (_bindPlugIn[index]._selectRowAfter) _bindPlugIn[index]._selectRowAfter(_crrentID);
				}
				if (typeof _onSelectRow == "function") {
					_onSelectRow(rowid, p);
				}
			} else {
				var currentChildren = k01.currentChildren;
				var callFuns = [];
				var i = -1;
				for (var p01 in _fData) {
					i++;
					if (i == 0) {
						callFuns[i] = function() {
							for (var index in _bindPlugIn) {
								if (_bindPlugIn[index]._selectRowAfter) _bindPlugIn[index]._selectRowAfter(_crrentID);
							}
							if (typeof _onSelectRow == "function") {
								_onSelectRow(rowid, p);
							}
						}
					} else {
						callFuns[i] = null;
					}
				}
				if (i == -1) {
					for (var index in _bindPlugIn) {
						if (_bindPlugIn[index]._selectRowAfter) _bindPlugIn[index]._selectRowAfter(_crrentID);
					}
					if (typeof _onSelectRow == "function") {
						_onSelectRow(rowid, p);
					}
				} else {
					if (currentChildren) {
						for (var p01 in _fData) {
							cData01 = _fData[p01];
							if (currentChildren[cData01.getDataID()]) { //加载，
								cData01._show(currentChildren[cData01.getDataID()]);
								var k = callFuns.pop();
								if (k) k();
							} else { //刷新
								_fData[p01].refreshData(function(data, flag) {
									var k = callFuns.pop();
									if (k) k();
								});
							}
						}
					} else {
						for (var p01 in _fData) {
							_fData[p01].refreshData(function() {
								var k = callFuns.pop();
								if (k) k();
							});
						}
					}
				}
			}

		}
		this._show = function(focusChildren) {

		}
		this._getSaveData = function() {
			var updates = [],
				inserts = [];
			var d01;
			for (var i in _dataNew) {
				d01 = _dataNew[i];
				d01[_version] = 0;
				inserts.push(d01);
			}
			for (var i in _dataEdite) {
				d01 = _dataEdite[i];
				d01[identifer] = i;
				d01[_version] = _data[i]["data"][_version];
				updates.push(d01);
			}
			return [inserts, updates, _dataDelete, _dataVersion];
		};
		this._newData = function(successCallBack, callback, count) {
			if (_newAction && _newAction.url) {
				var param;
				if (_newAction.param) {
					param = _newAction.param;
				} else {
					param = {};
				}
				param["rand"] = new Date().getTime();
				param["Agilesoft_Data"] = true;
				param["Agilesoft_DataKey"] = _dataKey;
				param["Agilesoft_DataFieldKey"] = identifer;
				param["Agilesoft_AskType"] = "Agilesoft_IsAskNew";
				param["Agilesoft_DataVersion"] = _dataVersion;
				param["Agilesoft_new_count"] = count;
 
				if (_fk) {
					for (var k in _fk) {
						if (!_fk[k].data.getCurrentID()) {
							utils.print("没有获取关联的主表数据，请检查操作！");
							return;
						}
					}
				}

				ajax.post(_newAction.url, param, function(data, textStatus) {

					if (textStatus) {
						if (!data || !data.status) {
							return _onAfterNew && _onAfterNew(null, false, "新增失败！"), callback && callback(null, false, "新增失败！"), void 0;
						}
						if (data.status == "FAILURE") return _onAfterNew && _onAfterNew(null, false, data.msg || "新增失败！"), callback && callback(null, false, data.msg || "新增失败！"), void 0;

						var localData = data.data;

						var re = localData.data;
						_dataKey = localData['Agilesoft_DataKey'];
						var uuid;
						var _defaultValues;

						if (!_class) {
							_class = re["class"].val;
						}
						delete re["class"]; 
						delete re[_version];
						uuid = re[identifer].val;
						delete re[identifer];
						if (_fk) {
							for (var k in _fk) {
								re[_fk[k].rel] = {
									val: _fk[k].data.getCurrentID()
								};
							}
						}
						_defaultValues = re;

						var s01 = {};
						s01[identifer] = uuid;
						s01[_version] = 0;
						var value;
						for (var i in _defaultValues) {
							var default1 = _defaultValues[i];
							if (default1 && default1.val) {
								value = default1.val;
								if (value == null || value == undefined) {
									value = null;
								} else if (typeof value == "function") {
									value = value();
								}
							} else {
								value = null;
							}
							s01[i] = value;
						}
						if (parseInt(count) > 1) {
							var newRowids = localData.Agilesoft_new_rowids;
							_this._loadData(s01, "new");
							var otherNew;
							for (var i in newRowids) {
								otherNew = cloneBean(s01);
								otherNew[identifer] = newRowids[i];
								_this._loadData(otherNew, "new");
							}
							newRowids.push(uuid)
							successCallBack(newRowids);
						} else {
							_this._loadData(s01, "new");
							successCallBack(uuid);
						}

					} else {
						if (_onAfterNew) _onAfterNew(null, false, "新增失败！");
						if (callback) callback(null, false, "新增失败！");
					}
				});
			} else {
				if (_onAfterNew) _onAfterNew(null, false, "请配置" + _id + "的newAction");
				if (callback) callback(null, false, "请配置" + _id + "的newAction");
			}
		};
		this.newData = function(callback, count) {
			_this._newData(function(re) {
				if (_onAfterNew) _onAfterNew(re, true);
				if (typeof callback == "function") {
					callback(re, true);
				}
			}, callback, count);
		};

		this.deleteCurrentData = function() {
			var rowid = _crrentID;
			if (!rowid) {
				if (_onAfterDelete) _onAfterDelete(null, false, "deleteCurrentData没有设置焦点数据行");
				if (callback) callback(null, false, "deleteCurrentData没有设置焦点数据行");
				return;
			}
			_this.deleteByRowID(rowid);
			if (_onAfterDelete) _onAfterDelete(rowid, true);
			if (typeof callback == "function") {
				callback(rowid, true);
			}
		};
		this.deleteByRowID = function(rowid) {
			if (!_data[rowid]) {
				return;
			}
			if (_data[rowid]["status"] == "new") {
				delete _dataNew[rowid];
				_data[rowid]["status"] = "delete";
			} else {
				_data[rowid]["status"] = "delete";
				_dataDelete.push(rowid);
			}
			for (var i in _rowidIndex) {
				if (_rowidIndex[i] == rowid) {
					_rowidIndex.splice(i, 1);
				}
			}
			var p1;
			for (var i in _fData) {
				p1 = _fData[i]._getFKey(_this);
				_fData[i].deleteData(p1, rowid);
			}
			_this._changeDataVersion();
			if (_onAfterDelete) _onAfterDelete(rowid, true);
			if (typeof callback == "function") {
				callback(rowid, true);
			}
		};

		this.deleteData = function(rel, val) {
			var p1;
			for (var rowid in _data) {
				p1 = _data[rowid]["data"][rel];
				if (p1 && p1.length > 0 && p1[p1.length - 1] == val) {
					_this.deleteByRowID(rowid);
				}
			}
		};

		this._getFKey = function(p) {
			for (var i in _fk) {
				if (_fk[i].data.getDataID() == p.getDataID()) {
					return _fk[i].rel;
				}
			}
		};
		this._getFK = function(data) {
			for (var i in _fk) {
				if (_fk[i].data.getDataID() == data.getDataID()) {
					return _fk[i];
				}
			}
		};

		this.getValue = function(relation, rowid) {
			if (!rowid) rowid = _crrentID;
			if (!rowid) {
				return;
			}
			if (!_data[rowid] || _data[rowid].status == "delete") {
				return;
			}
			var p = _dataNew[rowid]; 
			if (p) {
				return p[relation];
			} else {
				p = _dataEdite[rowid];
				if (p) {
					var val = p[relation];
					if (val == undefined) {
						return _data[rowid]["data"][relation];
					} else {
						return val;
					}
				} else {
					return _data[rowid]["data"][relation];
				}
			}
		};

		this.setValue = function(relation, val, rowid) {
			if (!rowid) rowid = _crrentID;
			if (!rowid) {
				utils.print(rowid + "setValue指定的rowid为空");
				return;
			}
			var k = _this._setValueToData(relation, val, rowid);
			if (k === true) {
				
			}
		};

		this.getRowID = function(index) {
			return _rowidIndex[index];
		};

		this.getIndex = function(rowid) {
			for (var i = 0; i < _rowidIndex.length; i++) {
				if (_rowidIndex[i] == rowid) return i;
			}
			return -1;
		};

		this._setIndex = function(rowids) {
			if (rowids instanceof Array) _rowidIndex = rowids;
		};
		this._setValueToData = function(relation, val, rowid) {
			if (!_data[rowid]) {
				return false;
			}
			var status = _data[rowid]["status"];
			if (status == "delete") false;

			var valOld = _this.getValue(relation, rowid);
			
			if (true) {
				if (status == "new") {
					_dataNew[rowid][relation] = val;
				} else if (status == "edit") {
					_dataEdite[rowid][relation] = val;
				} else if (status == "none") {
					_setStatus(rowid, "edit");
					var p = _dataEdite[rowid];
					if (!p) {
						p = _dataEdite[rowid] = {};
					}
					p[relation] = val;
				}
				_this._changeDataVersion();
				if (typeof(_onValueChanged) == "function") {
					_onValueChanged(rowid, relation, val, valOld);
				}
				return true;
			}
			return false;
		};
		this._refreshData = function(successCallBack, callback) {
			if (!_queryAction || !_queryAction.url) {
				if (_onLoaded) _onLoaded(null, false, _id + "查询action未配置");
				if (typeof callback == "function") {
					callback(null, false, _id + "查询action未配置");
				}
				return;
			};
			var param = parseParam(_queryAction.param);
			if (_fk) {
				for (var k in _fk) {
					param[_fk[k].rel] = _fk[k].data.getCurrentID() || "_Agilesoft_No_ParentID_";;
				}
			}
			param["Agilesoft_Data"] = true;
			param["Agilesoft_DataKey"] = _dataKey;
			param["Agilesoft_DataFieldKey"] = identifer;
			param["Agilesoft_AskType"] = "Agilesoft_IsAskRefresh";
			param["Agilesoft_DataVersion"] = _dataVersion;
			param["Agilesoft_DataFreshKey"] = _FreshKey;
			for (var index in _bindPlugIn) {
				if (_bindPlugIn[index]._refreshBefore) _bindPlugIn[index]._refreshBefore(param);
			}
			ajax.post(_queryAction.url, param, function(data, flag, msg) {
				if (data.status == "SUCCESS") {
					var local_freshKey = data.data.Agilesoft_DataFreshKey;
					if (local_freshKey == _FreshKey) {
						_dataKey = data.data.Agilesoft_DataKey;
						_FreshKey++;
						try {
							data = eval("(" + data.data.data + ")");
						} catch (e) {
							if (_onLoaded) _onLoaded(null, false, e);
							if (typeof callback == "function") {
								callback(null, false, e);
							}
							return;
						}
						if (data["class"] && !_class) {
							_class = data["class"];
						}
						if (_this._loadDatas(data["rows"], callback) == true) {
							successCallBack(data, data.other);
						} else {
							if (_onLoaded) _onLoaded(null, false, _id + "数据格式不对，请检查代码");
							if (callback) callback(null, false, _id + "数据格式不对，请检查代码");
						}
					} else {
						if (_onLoaded) _onLoaded(null, false);
						if (callback) callback(null, false);
					}
				} else if (data.status == "FAILURE") {
					if (_onLoaded) _onLoaded(null, false);
					if (callback) callback(null, false);
				} else {
					if (_onLoaded) _onLoaded(data, false, _id + "数据格式不对，请检查代码");
					if (callback) callback(null, false, _id + "数据格式不对，请检查代码");
				}
			});
		};
		this.clear = function() {
			_data = {};
			_rowidIndex = [];
			_dataNew = {};
			_dataDelete = [];
			_dataEdite = {};
			for (var p in _fData) {
				_fData[p].clear();
			}
			var d01, d02;
			var pData;
			var _fk = config.fk;
			for (var f in _fk) {
				d02 = _fk[f].data;
				pData = d02._getCoreData();
				for (var t in pData) {
					delete pData[t]["currentChildren"]
				}
			}
			_this._changeDataVersion();
		};

		this.fetchData = function(callback) {
			_this.clear();
			_this.refreshData(callback);
		};

		this.refreshData = function(callback) {
			_this._refreshData(function(data, otherData) {
				_this._setFocusToParent(_rowidIndex, true);
				if (_onLoaded) _onLoaded(data["rows"], true, otherData);
				if (callback) callback(data["rows"], true, otherData);
			}, callback);
		};

		this._setFocusToParent = function(dataRowid, clearFlag, total) {
			var d01, d02;
			var _fk = config.fk;
			for (var f in _fk) {
				d02 = _fk[f].data;
				d02._setFocusChildren(this, dataRowid, clearFlag, total);
			}
		};
	
		var removeData = function(rowid) {
				if (!rowid) {
					return;
				}
				if (!_data[rowid]) return;
				delete _data[rowid];
				delete _dataNew[rowid];
				delete _dataEdite[rowid];
				for (var i in _dataDelete) {
					if (_dataDelete[i] == rowid) {
						_dataDelete.splice(i, 1);
						break;
					}
				}
				for (var i in _rowidIndex) {
					if (_rowidIndex[i] == rowid) {
						_rowidIndex.splice(i, 1);
						break;
					}
				}
			};
		this.loadData = function(data, status ) {
			_this._loadData(data, status);
		};

		this._loadData = function(data, status /**new，none**/ ) {
			if (!data) {
				utils.print("loadData出错，没有获取数据");
			} else {
				var index;
				var rowid = data[identifer];
				if (!rowid) {
					utils.print("loadData出错，没有“" + identifer + "”主键");
					return;
				}
				removeData(rowid);
				if (data["class"] && !_class) {
					_class = data["class"];
				}
				delete data["class"];
				var dd;
				(dd = {})["data"] = cloneBean(data);
				_data[rowid] = dd;
				if ("new" == status) {
					dd["status"] = "new";
					_this._changeDataVersion();
					_dataNew[rowid] = dd.data; 
					_rowidIndex.splice(0, 0, rowid);
					index = 0;
				} else if (status == null || status == undefined || status == "none") {
					dd["status"] = "none";
					_this._changeDataVersion();
					index = _rowidIndex.push(rowid);
				} else {
					utils.print("loadData参数status错误，只支持new或者none,没有值的时候默认为none");
					return;
				}

				var cData01 = null,
					pRel = null,
					cFK = null,
					k02 = null;
				for (var i in data) {
					if (data[i] instanceof Array) {
						for (k02 in _fData) {
							cData01 = _fData[k02];
							cFK = cData01._getFK(this);
							if (cFK) {
								pRel = cFK.pRel;
								if (pRel && pRel == i) {
									cData01._loadDatas(data[i]);
									delete data[i];
								}
							}
						}
					}
				}
				return index;
			}
		};

		this._loadDatas = function(datas, callback) {
			var re = [];
			if (datas instanceof Array) {
				for (var i = 0; i < datas.length; i++) {
					re.push(datas[i][identifer]);
					_this._loadData(datas[i]);
				}
				return true;
			} else {
				if (typeof _onLoaded == "function") {
					_onLoaded(null, false, id + "中的loadDatas加载的数据格式不对，请检查");
				}
				if (callback) callback(null, false, id + "中的loadDatas加载的数据格式不对，请检查");
				return false;
			};
		};
		this.getCurrentID = function() {
			return _crrentID;
		};

		this.getData = function(rowid) {
			if (!rowid) rowid = _crrentID;
			if (!rowid) {
				utils.print("数据集" + id + "中的getData参数错误，没有rowid");
				return;
			}
			if (!_data[rowid] || _data[rowid].status == "delete") {
				return;
			}
			var p = _dataNew[rowid];
			if (p) {
				return cloneBean(p);
			} else {
				var e = _dataEdite[rowid] || {};
				var s = _data[rowid] && _data[rowid]["data"];
				if (s) {
					var k = {};
					for (var p in s) {
						var val = e[p];
						if (val == undefined) {
							k[p] = s[p];
						} else {
							k[p] = val;
						}
					}
					return k;
				} else {
					return;
				}
			}
		};

		this.getDataModified = function(rowid) {
			return _dataEdite[rowid];
		}
		this.getDataKey = function() {
			return _dataKey;
		}
		var uuid = function() {
				var re = "";
				if (!re) {
					var s = [];
					var hexDigits = "0123456789abcdef";
					for (var i = 0; i < 36; i++) {
						s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
					}
					s[14] = "4";
					s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
					s[8] = s[13] = s[18] = s[23] = "";
					re = s.join("");
				}
				return "smd_rand" + re;
			}
		var _initial = function() {
				var bid = config['bsessionid'];
				var bsessionid = "";
				if (bid) {
					bsessionid = bid;
				} else {
					bsessionid = uuid();
				}
				_dataKey = bsessionid + "@data_" + new Date().getTime() + "_" + Math.floor(Math.random() * 10000);
			}
		_initial();
	}
module.exports = {
	creat: function(p1, config) {
		return new data_base(p1, config);
	}
};