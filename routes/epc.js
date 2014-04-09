
// { epc: '101', itemType: '01', collection: 'epc'}
// {itemType:"01",typeName:"电脑", collection: 'itemType'}


function Epc(_epc, _itemType){
	this.epc = _epc;
	this.itemType = _itemType;
	// this.collection = 'epc';
	// this.validateEpc = function(){
	// 	return (this.epc != null && this.itemType != null);
	// };
}
Epc.prototype.validateEpc = function(_callback){
	if((this.epc != null && this.itemType != null)){
		_callback(null, this);
	}else{
		_callback('validateEpc error', this);
	}
}

// function ItemInfo(_itemType, _typeName){
// 	this.itemType = _itemType;
// 	this.typeName = _typeName;
// 	this.collection = 'itemType';
// }
// ItemInfo.prototype.validateItemInfo = function(){
// 	return (this.itemType != null) && (this.typeName != null);
// }
module.exports = Epc;