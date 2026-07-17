// AlumniScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Linking } from 'react-native';
import Header from '../../components/Header';
import StudentMenuBar from '../../components/StudentMenuBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

var C = { primary:'#6366f1',white:'#fff',gray:'#6b7280',lightGray:'#f3f4f6',border:'#e5e7eb',black:'#000' };

export default function AlumniScreen({ navigation }) {
  var [alumni, setAlumni] = useState([]);
  var [loading, setLoading] = useState(true);
  var { logout } = useAuth();
  useEffect(function(){ load(); },[]);

  async function load() {
    try { setLoading(true); var r = await api.get('/alumni');
      var d = r.data.alumni||r.data.data||r.data||[]; setAlumni(Array.isArray(d)?d:[]);
    } catch(e){ console.log('Alumni err:',e.message); } setLoading(false);
  }

  function getInitials(name){ if(!name) return '?'; var p=name.trim().split(' ');
    return p.length>=2?p[0][0].toUpperCase()+p[1][0].toUpperCase():p[0][0].toUpperCase(); }

  function contact(p){
    Alert.alert(p.name||'Alumni',
      'Job Title: '+(p.jobTitle||p.currentPosition||'N/A')+'\nCompany: '+(p.company||p.currentCompany||'N/A')+'\nEmail: '+(p.email||'N/A'),
      [{ text:'Send Email', onPress:function(){ if(p.email) Linking.openURL('mailto:'+p.email); } },
       { text:'Close', style:'cancel' }]);
  }

  function renderCard({item}){
    return(<View style={s.card}><View style={s.row}>
      <View style={s.avatar}><Text style={s.avatarT}>{getInitials(item.name)}</Text></View>
      <View style={{marginLeft:12,flex:1}}>
        <Text style={s.name}>{item.name||'Unknown'}</Text>
        <Text style={s.job}>{item.jobTitle||item.currentPosition||'Alumni'}</Text>
        <Text style={s.comp}>{item.company||item.currentCompany||''}</Text>
      </View></View>
      <TouchableOpacity style={s.cBtn} onPress={function(){contact(item);}}>
        <Text style={s.cBtnT}>Contact</Text></TouchableOpacity></View>);
  }

  return(<View style={s.cont}>
    <Header title="Connect with Alumni" navigation={navigation} role="student" showLogout={true} onLogout={function(){logout();}}/>
    <View style={{flex:1}}>
      {loading?<View style={s.ctr}><ActivityIndicator size="large" color={C.primary}/></View>:
       alumni.length===0?<View style={s.ctr}><Text style={{fontSize:16,color:C.gray}}>No alumni found</Text></View>:
       <FlatList data={alumni} keyExtractor={function(i,x){return(i.id||'')+x;}} renderItem={renderCard}
         style={{flex:1}} contentContainerStyle={{padding:10,paddingBottom:100}} showsVerticalScrollIndicator={true}/>}
    </View>
    <StudentMenuBar activeScreen="Alumni" navigation={navigation}/>
  </View>);
}

var s=StyleSheet.create({
  cont:{flex:1,backgroundColor:'#f3f4f6'},ctr:{flex:1,justifyContent:'center',alignItems:'center'},
  card:{backgroundColor:'#fff',borderRadius:12,padding:15,marginBottom:10,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.08,shadowRadius:4,elevation:2},
  row:{flexDirection:'row',alignItems:'center'},
  avatar:{width:50,height:50,borderRadius:25,backgroundColor:'#6366f1',justifyContent:'center',alignItems:'center'},
  avatarT:{color:'#fff',fontSize:18,fontWeight:'bold'},
  name:{fontSize:16,fontWeight:'bold',color:'#000'},job:{fontSize:13,color:'#6366f1',marginTop:2},comp:{fontSize:13,color:'#6b7280',marginTop:2},
  cBtn:{borderWidth:1,borderColor:'#e5e7eb',borderRadius:6,padding:8,alignSelf:'flex-start',marginTop:12},
  cBtnT:{color:'#6b7280',fontSize:13,fontWeight:'500'},
});
