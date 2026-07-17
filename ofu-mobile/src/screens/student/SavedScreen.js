// SavedScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Header from '../../components/Header';
import StudentMenuBar from '../../components/StudentMenuBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

var C = { primary:'#6366f1',white:'#ffffff',gray:'#6b7280',lightGray:'#f3f4f6',border:'#e5e7eb',black:'#000000' };
var TB = { job:'#22c55e',internship:'#3b82f6',scholarship:'#f59e0b',freelance:'#f97316',event:'#6366f1' };

export default function SavedScreen({ navigation }) {
  var [items, setItems] = useState([]);
  var [loading, setLoading] = useState(true);
  var { logout } = useAuth();
  useEffect(function(){ load(); },[]);

  async function load() {
    try { setLoading(true); var r = await api.get('/saved');
      var d = r.data.saved||r.data.data||r.data||[]; setItems(Array.isArray(d)?d:[]);
    } catch(e){ console.log('Saved err:',e.message); } setLoading(false);
  }
  async function remove(id) {
    try { await api.delete('/saved/'+id);
      setItems(items.filter(function(i){return(i.opportunityId||i.id)!==id;}));
    } catch(e){ Alert.alert('Error','Failed to remove'); }
  }
  function details(o){ Alert.alert(o.title||'','Type: '+(o.type||'N/A')+'\n'+(o.description||'')); }

  function renderCard({item}){
    var o=item.opportunity||item; var id=item.opportunityId||item.id;
    return(<View style={s.card}><View style={s.row}>
      <View style={[s.badge,{backgroundColor:TB[(o.type||'').toLowerCase()]||C.gray}]}>
        <Text style={s.badgeT}>{(o.type||'other').toUpperCase()}</Text></View>
      <TouchableOpacity onPress={function(){remove(id);}}><Text style={{fontSize:20}}>🔖</Text></TouchableOpacity>
    </View>
    <Text style={s.title}>{o.title||'Untitled'}</Text>
    <Text style={s.comp}>{o.company||o.organization||''}</Text>
    <Text style={s.desc} numberOfLines={2}>{o.description||''}</Text>
    <TouchableOpacity style={s.vBtn} onPress={function(){details(o);}}>
      <Text style={s.vBtnT}>View Details</Text></TouchableOpacity></View>);
  }

  return(<View style={s.cont}>
    <Header title="Saved Opportunities" navigation={navigation} role="student" showLogout={true} onLogout={function(){logout();}}/>
    <View style={{flex:1}}>
      {loading?<View style={s.ctr}><ActivityIndicator size="large" color={C.primary}/></View>:
       items.length===0?<View style={s.ctr}><Text style={{fontSize:16,color:C.black,fontWeight:'500'}}>No saved opportunities yet.</Text>
         <Text style={{fontSize:13,color:C.gray,marginTop:6,textAlign:'center'}}>Browse opportunities and save ones you like.</Text></View>:
       <FlatList data={items} keyExtractor={function(i,x){return(i.id||'')+x;}} renderItem={renderCard}
         style={{flex:1}} contentContainerStyle={{padding:10,paddingBottom:100}} showsVerticalScrollIndicator={true}/>}
    </View>
    <StudentMenuBar activeScreen="Saved" navigation={navigation}/>
  </View>);
}

var s=StyleSheet.create({
  cont:{flex:1,backgroundColor:'#f3f4f6'},ctr:{flex:1,justifyContent:'center',alignItems:'center',padding:20},
  card:{backgroundColor:'#fff',borderRadius:12,padding:15,marginBottom:10,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.08,shadowRadius:4,elevation:2},
  row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  badge:{paddingHorizontal:8,paddingVertical:3,borderRadius:4},badgeT:{fontSize:10,fontWeight:'600',color:'#fff'},
  title:{fontSize:16,fontWeight:'bold',color:'#000',marginTop:8},comp:{fontSize:13,color:'#6b7280',marginTop:4},
  desc:{fontSize:13,color:'#6b7280',marginTop:6,lineHeight:18},
  vBtn:{borderWidth:1,borderColor:'#e5e7eb',borderRadius:6,padding:8,alignItems:'center',marginTop:12},
  vBtnT:{color:'#6b7280',fontSize:13,fontWeight:'500'},
});
