-- ============================================================
-- Supabase SQL Editor এ এই পুরো SQL paste করে Run করুন
-- পুরনো table থাকলে আগে মুছে নতুন তৈরি হবে
-- ============================================================

DROP TABLE IF EXISTS students;

CREATE TABLE students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  roll integer NOT NULL,
  name text NOT NULL,
  class_num text NOT NULL DEFAULT '9',
  exam_year text NOT NULL DEFAULT '2025',
  exam_type text NOT NULL DEFAULT 'নির্বাচনি পরীক্ষা',

  -- বাংলা (সব শ্রেণি)
  bangla1_naib numeric DEFAULT 0, bangla1_written numeric DEFAULT 0,
  bangla2_naib numeric DEFAULT 0, bangla2_written numeric DEFAULT 0,

  -- ইংরেজি (সব শ্রেণি)
  english1 numeric DEFAULT 0,
  english2 numeric DEFAULT 0,

  -- গণিত (সব শ্রেণি)
  math_naib numeric DEFAULT 0, math_written numeric DEFAULT 0,

  -- বিজ্ঞান (শ্রেণি ৬-৮)
  science_naib numeric DEFAULT 0, science_written numeric DEFAULT 0,

  -- বাওবি (শ্রেণি ৬-৮)
  bgst_naib numeric DEFAULT 0, bgst_written numeric DEFAULT 0,

  -- ইসলাম শিক্ষা (সব শ্রেণি)
  islam_naib numeric DEFAULT 0, islam_written numeric DEFAULT 0,

  -- কৃষি শিক্ষা (শ্রেণি ৬-৮, চতুর্থ বিষয়)
  krishi_naib numeric DEFAULT 0, krishi_written numeric DEFAULT 0,

  -- পদার্থবিজ্ঞান (শ্রেণি ৯-১০)
  physics_naib numeric DEFAULT 0, physics_written numeric DEFAULT 0,

  -- রসায়ন (শ্রেণি ৯-১০)
  chemistry_naib numeric DEFAULT 0, chemistry_written numeric DEFAULT 0,

  -- জীববিজ্ঞান (শ্রেণি ৯-১০)
  biology_naib numeric DEFAULT 0, biology_written numeric DEFAULT 0,

  -- উচ্চতর গণিত/কৃষি (শ্রেণি ৯-১০, চতুর্থ বিষয়)
  higher_math_naib numeric DEFAULT 0, higher_math_written numeric DEFAULT 0,

  -- বাংলাদেশ ও বিশ্বপরিচয় (শ্রেণি ৯-১০)
  bgst910_naib numeric DEFAULT 0, bgst910_written numeric DEFAULT 0,

  -- তথ্য ও যোগাযোগ প্রযুক্তি (সব শ্রেণি, ২৫ নম্বর)
  ict numeric DEFAULT 0,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX ON students(class_num, exam_year, exam_type);
CREATE INDEX ON students(roll);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON students FOR ALL USING (true) WITH CHECK (true);
