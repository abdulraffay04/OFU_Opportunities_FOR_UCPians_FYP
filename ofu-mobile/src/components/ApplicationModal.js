// ApplicationModal.js
// Shared modal for viewing applicant profiles.
// Used by both employer and admin application screens.
// Shows 5 collapsible sections: Contact, Academic, Skills, Cover Letter, Resume.

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView,
  StyleSheet, Linking,
} from 'react-native';

var C = {
  purple: '#6366f1', white: '#fff', gray: '#6b7280',
  lightGray: '#f3f4f6', border: '#e5e7eb', black: '#000',
  green: '#22c55e', error: '#ef4444',
};

// Props: visible, application, onClose, onAccept, onReject
export default function ApplicationModal({ visible, application, onClose, onAccept, onReject }) {
  var [showContact, setShowContact] = useState(false);
  var [showAcademic, setShowAcademic] = useState(false);
  var [showSkills, setShowSkills] = useState(true);
  var [showCover, setShowCover] = useState(false);
  var [showResume, setShowResume] = useState(false);

  if (!application) return null;

  var student = application.student || application.user || {};
  var name = student.name || application.studentName || 'Applicant';
  var skills = student.skills || application.skills || '';
  var skillsArray = typeof skills === 'string'
    ? skills.split(',').map(function (s) { return s.trim(); }).filter(Boolean)
    : (Array.isArray(skills) ? skills : []);

  function getInitials(n) {
    if (!n) return '?';
    var p = n.trim().split(' ');
    return p.length >= 2 ? p[0][0].toUpperCase() + p[1][0].toUpperCase() : p[0][0].toUpperCase();
  }

  // Collapsible section
  function Section({ title, isOpen, onToggle, children }) {
    return (
      <View style={s.section}>
        <TouchableOpacity style={s.sectionHeader} onPress={onToggle}>
          <Text style={s.sectionTitle}>{title}</Text>
          <Text style={s.sectionArrow}>{isOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {isOpen && <View style={s.sectionBody}>{children}</View>}
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade"
      onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.modal}>
          <ScrollView showsVerticalScrollIndicator={true}>
            {/* Header */}
            <View style={s.header}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{getInitials(name)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.name}>{name}</Text>
                <Text style={s.appliedFor}>
                  Applied for: {application.opportunityTitle || application.opportunity?.title || 'Opportunity'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ fontSize: 22, color: C.gray }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 1. Contact */}
            <Section title="Contact Information" isOpen={showContact}
              onToggle={function () { setShowContact(!showContact); }}>
              <Text style={s.info}>📧 Email: {student.email || 'N/A'}</Text>
              <Text style={s.info}>📞 Phone: {student.phone || 'N/A'}</Text>
            </Section>

            {/* 2. Academic */}
            <Section title="Academic Information" isOpen={showAcademic}
              onToggle={function () { setShowAcademic(!showAcademic); }}>
              <Text style={s.info}>🎓 Department: {student.department || 'N/A'}</Text>
              <Text style={s.info}>📅 Semester: {student.semester || 'N/A'}</Text>
              <Text style={s.info}>⭐ CGPA: {student.cgpa || 'N/A'}</Text>
              <Text style={s.info}>📝 Bio: {student.bio || 'N/A'}</Text>
            </Section>

            {/* 3. Skills */}
            <Section title="Skills" isOpen={showSkills}
              onToggle={function () { setShowSkills(!showSkills); }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {skillsArray.length > 0 ? skillsArray.map(function (sk, i) {
                  return (
                    <View key={i} style={s.skillTag}>
                      <Text style={s.skillText}>{sk}</Text>
                    </View>
                  );
                }) : <Text style={{ color: C.gray }}>No skills listed</Text>}
              </View>
            </Section>

            {/* 4. Cover Letter */}
            <Section title="Cover Letter" isOpen={showCover}
              onToggle={function () { setShowCover(!showCover); }}>
              <View style={s.coverBox}>
                <Text style={{ fontSize: 13, color: C.black, lineHeight: 20 }}>
                  {application.coverLetter || 'No cover letter provided'}
                </Text>
              </View>
            </Section>

            {/* 5. Resume */}
            <Section title="Resume" isOpen={showResume}
              onToggle={function () { setShowResume(!showResume); }}>
              {application.resumeUrl ? (
                <TouchableOpacity style={s.resumeBtn}
                  onPress={function () { Linking.openURL(application.resumeUrl); }}>
                  <Text style={{ color: C.white, fontWeight: '500' }}>View Resume</Text>
                </TouchableOpacity>
              ) : <Text style={{ color: C.gray }}>No resume uploaded</Text>}
            </Section>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.green, marginRight: 5 }]}
                onPress={onAccept}>
                <Text style={s.actionText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.error, marginLeft: 5 }]}
                onPress={onReject}>
                <Text style={s.actionText}>Reject</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={{ color: C.gray, fontSize: 14, fontWeight: '500' }}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

var s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '90%', maxHeight: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  appliedFor: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  section: { marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#f3f4f6', borderRadius: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#000' },
  sectionArrow: { fontSize: 12, color: '#6b7280' },
  sectionBody: { padding: 10 },
  info: { fontSize: 13, color: '#000', lineHeight: 22 },
  skillTag: { backgroundColor: '#6366f1', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, margin: 3 },
  skillText: { fontSize: 12, color: '#fff', fontWeight: '500' },
  coverBox: { backgroundColor: '#f3f4f6', padding: 10, borderRadius: 8 },
  resumeBtn: { backgroundColor: '#6366f1', borderRadius: 6, padding: 10, alignItems: 'center' },
  actionBtn: { flex: 1, borderRadius: 8, padding: 12, alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  closeBtn: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 10 },
});
