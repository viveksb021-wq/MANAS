from app.database import SessionLocal
from app.models import Person, PatientProfile, User, Guardian, Memory, Place, Routine, Reminder

def restore():
    db = SessionLocal()

    # 1. Clean up duplicate test Biren Das records (from pytest test loops)
    deleted = db.query(Person).filter(Person.name == 'Biren Das').delete()
    print(f'Deleted {deleted} test Biren Das rows')

    # 2. Ensure PatientProfile 1 (Prasad)
    p1 = db.query(PatientProfile).filter(PatientProfile.id == 1).first()
    if not p1:
        user = db.query(User).filter(User.email == 'vivek@manas.org').first()
        p1 = PatientProfile(id=1, user_id=user.id if user else 2, age=74, emergency_contact='+91 98640 55789', preferred_language='en', onboarding_completed=True)
        db.add(p1)
        db.commit()

    # 3. Ensure PatientProfile 2 (Biren Das)
    p2 = db.query(PatientProfile).filter(PatientProfile.id == 2).first()
    if not p2:
        from app.auth import hash_password
        p2_user = db.query(User).filter(User.email == 'biren@manas.org').first()
        if not p2_user:
            p2_user = User(email='biren@manas.org', hashed_password=hash_password('biren123'), role='patient', full_name='Biren Das')
            db.add(p2_user)
            db.commit()
        p2 = PatientProfile(id=2, user_id=p2_user.id, guardian_id=1, age=79, emergency_contact='+91 94350 11223', preferred_language='as', onboarding_completed=True)
        db.add(p2)
        db.commit()
    elif not p2.guardian_id:
        p2.guardian_id = 1
        db.commit()

    # 4. Authoritative complete family members for Patient 1 (Prasad)
    p1_family = [
        {'name': 'Prasad', 'relationship': 'Patient', 'photo_url': '/images/family/patient.jpeg', 'notes': 'Self profile - 74 years old, retired school principal in Shillong.'},
        {'name': 'Sunita', 'relationship': 'Wife', 'photo_url': '/images/family/wife.jpeg', 'notes': 'Coordinates morning tea, daily medications & garden strolls.'},
        {'name': 'Ravi', 'relationship': 'Son', 'photo_url': '/images/family/son.jpeg', 'notes': 'Your elder son. Visits every weekend from Guwahati and calls daily.'},
        {'name': 'Meera', 'relationship': 'Daughter', 'photo_url': '/images/family/daughter.webp', 'notes': 'Your daughter. Lives nearby in Laitumkhrah, Shillong.'},
        {'name': 'Biren', 'relationship': '1st Brother', 'photo_url': '/images/family/brother-1.jpeg', 'notes': 'Your eldest brother. Retired engineer living in Jorhat.'},
        {'name': 'Kamla', 'relationship': "1st Brother's Wife", 'photo_url': '/images/family/brother-1-wife.jpeg', 'notes': 'Sister-in-law. Loves baking traditional Pitha sweets.'},
        {'name': 'Arun', 'relationship': 'Grandson', 'photo_url': '/images/family/brother-1-son.jpeg', 'notes': '14 years old. Loves playing classical guitar.'},
        {'name': 'Pooja', 'relationship': "1st Brother's Daughter", 'photo_url': '/images/family/brother-1-daughter.jpeg', 'notes': 'Niece. Studying medical science in Dibrugarh.'},
        {'name': 'Vikram', 'relationship': '2nd Brother', 'photo_url': '/images/family/brother-2.jpeg', 'notes': 'Your younger brother. Visits during Bihu festival.'},
        {'name': 'Asha', 'relationship': "2nd Brother's Wife", 'photo_url': '/images/family/brother-2-wife.jpeg', 'notes': 'Younger sister-in-law. Coordinates family video calls.'},
        {'name': 'Dr. Haren Barua', 'relationship': 'Family Doctor', 'photo_url': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80', 'notes': 'Physician at Shillong Medical Center.'},
        {'name': 'JYOTHIKA', 'relationship': 'Spouse', 'photo_url': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 'notes': 'Cherished family member enrolled by caregiver.'}
    ]

    for mem in p1_family:
        existing = db.query(Person).filter(Person.patient_id == 1, Person.name == mem['name']).first()
        if existing:
            existing.relationship = mem['relationship']
            existing.photo_url = mem['photo_url']
            existing.notes = mem['notes']
            existing.is_active = True
        else:
            p = Person(patient_id=1, name=mem['name'], relationship=mem['relationship'], photo_url=mem['photo_url'], notes=mem['notes'], is_active=True, frequently_seen=True)
            db.add(p)

    # 5. Authoritative family members for Patient 2 (Biren Das)
    p2_family = [
        {'name': 'Biren Das', 'relationship': 'Patient', 'photo_url': '/images/family/patient.jpg', 'notes': 'Self profile - 79 years old, retired tea estate supervisor.'},
        {'name': 'Meera Das', 'relationship': 'Daughter', 'photo_url': '/images/family/daughter.jpg', 'notes': 'Primary caregiver for Biren. Calls every morning.'},
        {'name': 'Pritam Das', 'relationship': 'Son', 'photo_url': '/images/family/son.jpg', 'notes': 'Son living in Guwahati. Brings groceries on Saturdays.'},
        {'name': 'Kavita Das', 'relationship': 'Wife', 'photo_url': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 'notes': 'Beloved wife.'}
    ]

    for mem in p2_family:
        existing = db.query(Person).filter(Person.patient_id == 2, Person.name == mem['name']).first()
        if existing:
            existing.relationship = mem['relationship']
            existing.photo_url = mem['photo_url']
            existing.notes = mem['notes']
            existing.is_active = True
        else:
            p = Person(patient_id=2, name=mem['name'], relationship=mem['relationship'], photo_url=mem['photo_url'], notes=mem['notes'], is_active=True, frequently_seen=True)
            db.add(p)

    db.commit()

    all_p1 = db.query(Person).filter(Person.patient_id == 1).all()
    print(f'Patient 1 People count: {len(all_p1)}')
    for p in all_p1:
        print(f' - ID {p.id}: {p.name} ({p.relationship})')

    all_p2 = db.query(Person).filter(Person.patient_id == 2).all()
    print(f'Patient 2 People count: {len(all_p2)}')
    for p in all_p2:
        print(f' - ID {p.id}: {p.name} ({p.relationship})')

if __name__ == '__main__':
    restore()
