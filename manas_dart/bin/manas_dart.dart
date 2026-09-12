import 'dart:io';
import 'package:http/http.dart' as http;

const String backendUrl = 'http://127.0.0.1:8000';

void main() async {
  print('===========================================================');
  print('       MANAS — Mental Health & Assistive Navigation AI    ');
  print('       (Dart Console Edition v1.0 - Elderly Care Suite)   ');
  print('===========================================================');
  print('');

  await checkBackendStatus();

  bool running = true;
  while (running) {
    print('\n------------------- MAIN NAVIGATION -------------------');
    print('1. 📍 Places I Know & Safe Navigation');
    print('2. 🎙️ Ask MANAS Voice Assistant');
    print('3. 👥 People I Know (Family & Friends)');
    print('4. 📋 Today\'s Schedule & Medication Check');
    print('5. 📊 Guardian & Caregiver Real-Time Monitoring');
    print('6. 🖼️ My Photo Memories & Recall Journal');
    print('0. 🚪 Exit MANAS Dart Application');
    print('-------------------------------------------------------');
    stdout.write('Select an option (0-6): ');

    String? input = stdin.readLineSync();
    print('');

    switch (input?.trim()) {
      case '1':
        showPlacesIKnow();
        break;
      case '2':
        await askManasVoiceAssistant();
        break;
      case '3':
        showPeopleIKnow();
        break;
      case '4':
        await showTodaySchedule();
        break;
      case '5':
        showGuardianPortal();
        break;
      case '6':
        showPhotoMemories();
        break;
      case '0':
        print('Thank you for using MANAS! Stay safe and have a wonderful day. ❤️');
        running = false;
        break;
      default:
        print('⚠️ Invalid selection. Please enter a number from 0 to 6.');
    }
  }
}

Future<void> checkBackendStatus() async {
  try {
    final response = await http.get(Uri.parse('$backendUrl/docs')).timeout(Duration(seconds: 2));
    if (response.statusCode == 200) {
      print('🟢 Connected to MANAS Backend API at $backendUrl');
    } else {
      print('🟡 MANAS Backend API returned status: ${response.statusCode}');
    }
  } catch (e) {
    print('🟡 MANAS Backend API at $backendUrl is starting / offline. Using Dart local memory suite.');
  }
}

void showPlacesIKnow() {
  print('================📍 PLACES I KNOW & SAFE NAVIGATION ================');
  print('Current Status: 🟢 You are currently at Home (124 Maple Street - Safe Zone)\n');
  print('Emergency Action:');
  print('  [ 🚨 TAKE ME HOME NOW ] -> Triggers instant audio turn-by-turn guidance back to 124 Maple Street.\n');
  print('Familiar Destinations:');
  print('  1. 🏠 Home (124 Maple Street) - 0.0 miles away [You are here]');
  print('  2. 🏡 Son David\'s House (45 Oak Lane) - 1.2 miles away');
  print('  3. 💊 Community Pharmacy (88 Main Street) - 0.5 miles away');
  print('  4. 🌳 City Park & Fountain (Greenwood Park) - 0.8 miles away');
  print('-------------------------------------------------------------------');
}

Future<void> askManasVoiceAssistant() async {
  print('================🎙️ ASK MANAS VOICE ASSISTANT ================');
  print('MANAS is listening... Type your question below (or choose a quick topic):\n');
  print('Quick Topics:');
  print('  A. "Where am I right now?"');
  print('  B. "What is my next reminder?"');
  print('  C. "Who is visiting me today?"');
  print('  D. "Did I take my morning medicine?"');
  stdout.write('\nEnter question (or A/B/C/D): ');

  String? query = stdin.readLineSync()?.trim();

  if (query == null || query.isEmpty) query = 'A';

  String answer = '';
  if (query.toUpperCase() == 'A' || query.contains('where')) {
    answer = 'You are safely at home in your living room at 124 Maple Street.';
  } else if (query.toUpperCase() == 'B' || query.contains('reminder')) {
    answer = 'Your next reminder is Afternoon Hydration & Snack at 1:00 PM.';
  } else if (query.toUpperCase() == 'C' || query.contains('visit')) {
    answer = 'Your son David is scheduled to visit you today at 4:00 PM.';
  } else if (query.toUpperCase() == 'D' || query.contains('medicine')) {
    answer = 'Yes, Grandma! You took your Morning Blood Pressure medication at 8:05 AM ✅.';
  } else {
    answer = 'I heard you ask: "$query". Everything is safe at home. David will visit at 4:00 PM!';
  }

  print('\n🔊 MANAS Response:');
  print('  "$answer"');
  print('---------------------------------------------------------------');
}

void showPeopleIKnow() {
  print('================👥 PEOPLE I KNOW — FAMILY GALLERY ================');
  print('Last Facial Recognition Anchor: "You are looking at David (Your Son)"\n');
  print('Family & Caregiver Contacts:');
  print('  1. 👨 David Vance [Son - Primary Contact]');
  print('     • Note: Visits on Tuesdays, lives 1.2 miles away.');
  print('     • Quick Action: Call (555-0192)');
  print('  2. 👩 Sarah Vance [Daughter]');
  print('     • Note: Calls every evening at 7:00 PM.');
  print('     • Quick Action: Call (555-0143)');
  print('  3. 👩‍⚕️ Dr. Emily Chen [Personal Physician]');
  print('     • Note: Clinic appointment on Thursday at 10:00 AM.');
  print('     • Quick Action: Call Clinic (555-0188)');
  print('  4. 👦 Mark Vance [Grandson]');
  print('     • Note: Plays piano, visits on weekends.');
  print('-------------------------------------------------------------------');
}

Future<void> showTodaySchedule() async {
  print('================📋 TODAY\'S SCHEDULE & MEDICATIONS ================');
  print('Patient: Eleanor Vance | Date: Today\n');
  print('Schedule Items:');
  print('  [8:00 AM]  💊 Morning Blood Pressure Meds  --->  ✅ TAKEN (8:05 AM)');
  print('  [1:00 PM]  🥛 Afternoon Hydration & Snack  --->  ✅ COMPLETED');
  print('  [4:00 PM]  👨 Son David Visit              --->  ⏳ UPCOMING');
  print('  [7:00 PM]  💊 Evening Memory Supplement   --->  ⏳ SCHEDULED');
  print('-------------------------------------------------------------------');
}

void showGuardianPortal() {
  print('================📊 GUARDIAN & CAREGIVER MONITORING ================');
  print('Active Patient: 👵 Eleanor Vance (Status: 🟢 Safe at Home)\n');
  print('Vital Metrics:');
  print('  • Medication Compliance: 100% (3/3 Taken)');
  print('  • Mood & Cognitive Index: Calm & Engaged');
  print('  • Geofence Status: Within Safe Perimeter (50m radius)');
  print('  • Active Emergency Alerts: 0 Active SOS Alerts\n');
  print('Recent Activity Log:');
  print('  [2:15 PM] Walked in garden (within 50m safe perimeter)');
  print('  [11:30 AM] Asked MANAS Voice Assistant about visitor schedule');
  print('  [9:00 AM] Son David visited for 45 mins');
  print('-------------------------------------------------------------------');
}

void showPhotoMemories() {
  print('================🖼️ MY PHOTO MEMORIES & RECALL JOURNAL ================');
  print('Featured Memory of the Day:');
  print('  📸 "Summer Picnic with Sarah & Mark at Greenwood Park (2022)"');
  print('  🎙️ Voice Note: "We had watermelon and listened to the fountain..." [0:45]\n');
  print('Memory Album Highlights:');
  print('  1. 💍 Golden Wedding Anniversary (1975)');
  print('  2. 🎓 David\'s Graduation from University');
  print('  3. 🏡 Summer Holiday House in Maine');
  print('  4. 🌹 Eleanor\'s Spring Rose Garden');
  print('----------------------------------------------------------------------');
}
