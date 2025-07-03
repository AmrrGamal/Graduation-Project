# 🦷 The Impact of Artificial Intelligence in Dentistry

This graduation project explores how **Artificial Intelligence (AI)** can be applied to dental X-ray images to assist in diagnosis and patient profiling. The system processes input X-ray images using four specialized deep learning models, producing predictions related to **gender**, **age**, **dental diseases**, and **tooth identification & numbering**.

---

## 📸 What This Project Does

Given a dental X-ray image as input, the system provides:

- **Gender**: Male / Female
- **Age**: Child / Adult
- **Dental Disease Detection**: Segmented regions of detected diseases
- **Tooth Identification and Numbering**: Count of total teeth and classification by type:
  - 12 Incisors
  - 4 Canines
  - 6 Premolars
  - 10 Molars

---

## 🧠 Deep Learning Models Used

### 1. **Gender Detection**
- **Goal:** Identify gender using dental structures in X-ray.
- **Models Used:** `VGG16`, `DenseNet121`, `InceptionV3`

### 2. **Age Detection**
- **Goal:** Determine whether the patient is a child or an adult.
- **Models Used:** `VGG16`, `DenseNet121`, `InceptionV3`

### 3. **Dental Disease Detection**
- **Goal:** Detect and segment visible oral diseases.
- **Model Used:** `YOLOv8-Segmentation`

### 4. **Tooth Identification & Numbering**
- **Goal:** Identify all 32 teeth and classify them.
- **Model Used:** `YOLOv8-Small (YOLOv8s)`

---

## 🧪 Example Output

Input:
![1004_jpg rf 7d60110f5fb8330418d02fdfe65c20de](https://github.com/user-attachments/assets/0c2e7681-8e5c-42a6-b994-e7a926c558a2)



Output:

Gender: Male

Age Group: Adult

Total Teeth: 32

  12 Incisors
  
  4 Canines
  
  6 Premolars
  
  10 Molars

Disease Detection: Image with segmented disease areas 

---

## 🌐 Web Application

- **Frontend:** React.js  
- **Backend:** .NET Web API  
- **Input:** X-ray image  
- **Output:** Prediction results and annotated image  
- **Hosted Locally or on Web Server**

---

## 🔧 Technologies Used

- **Python** (for AI model training)
- **Keras**, **TensorFlow**, **PyTorch**
- **OpenCV** (image preprocessing)
- **YOLOv8 (Ultralytics)** for object detection and segmentation
- **React.js** (frontend)
- **.NET Core** (backend REST API)


---

## 🎯 Project Goals

- Demonstrate the use of AI in healthcare, specifically dentistry
- Speed up the diagnosis process
- Assist dentists with pre-annotated X-rays
- Reduce the margin of human error in dental analysis

---

## 📌 Future Improvements

- Expand the dataset for higher model accuracy
- Add prediction confidence levels
- Integrate in Mobile app
- Deploy on cloud for real-time access

---

## 🧑‍💻 Contributors

- Project Lead: [Jana Emad]  
- Team Members: [Amr Gamal ,Rehab Sayed ,Andrew Gamil, Mariam Saad , Kholod Sadek]

---

## 📬 Contact

If you’re interested in this project or have any questions:

📧 Email: amrbngamalbnkamel@gmail.com 
🔗 LinkedIn: [https://www.linkedin.com/in/amr-gamal-038261292]  
🌐 GitHub: [https://github.com/AmrrGamal]
