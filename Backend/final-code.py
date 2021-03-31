# importing modules and packages
import sys
import cv2
import numpy as np
import dlib
import os
from keras_preprocessing import image
from keras.models import model_from_json
from keras.models import load_model
from keras.preprocessing.image import img_to_array
import subprocess
from PIL import Image
import face_recognition
import glob
import sqlite3
from datetime import datetime
count = 1
face_id = 1
# starting the webcam
cap = cv2.VideoCapture(0)

model_emo = model_from_json(open("models/facial_expression_model_structure.json", "r").read())
model_emo.load_weights('models/facial_expression_model_weights.h5')
model_gen = load_model("models/gender_detection.model")
age_net = cv2.dnn.readNetFromCaffe('models/deployage.prototxt', 'models/age_net.caffemodel')
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("models/shape_predictor_68_face_landmarks.dat")

# program would detect all these
emotions = ('angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral')
genders = ('Male', 'Female')
ages = ['15-20', '15-20', '15-20', '15-20', '25-32', '15-20', '15-20', '15-20']
# program will start capturing images until we press "q" or stop the program
while True:
    try:
        print("Looking for Faces...")
        ret, frame = cap.read()
        # converting the image in gray scale for emotion detection.
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = detector(gray)
        for face in faces:
            # used to find faces in a given pic
            x1 = face.left()
            y1 = face.top()
            x2 = face.right()
            y2 = face.bottom()
            # rect= cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 255), 1)
            detected_face0 = frame[y1:y2, x1:x2]

            # saves images in unknown folder
            cv2.imwrite("Images/unknown/" + str(face_id) + ".jpg", detected_face0)
            print("Image stored in Unknown Folder")

            # finding landmarks on the faces
            landmarks = predictor(gray, face)
            for n in range(0, 68):
                x = landmarks.part(n).x
                y = landmarks.part(n).y
                landmark_face = cv2.circle(frame, (x, y), 1, (255, 255, 255), -1)

            detected_face1 = frame[int(y1):int(y2), int(x1):int(x2)]
            # transform to gray scale
            detected_face2 = cv2.cvtColor(detected_face1, cv2.COLOR_BGR2GRAY)
            detected_face3 = cv2.resize(detected_face2, (48, 48))

            # cropping the image
            face_crop = cv2.resize(detected_face1, (96, 96))
            face_crop = face_crop.astype("float") / 255.0
            face_crop = img_to_array(face_crop)
            face_crop = np.expand_dims(face_crop, axis=0)

            # All the models are called here i.e. age,emotion and gender
            blob = cv2.dnn.blobFromImage(detected_face1, 1, (227, 227), swapRB=False)
            age_net.setInput(blob)
            age_preds = age_net.forward()
            i = age_preds[0].argmax()
            age = ages[i]
            age_con = age_preds[0][i]
            text_age = "{}: {:.2f}%".format(age, age_con * 100)

            img_pixels = detected_face3
            img_pixels = img_to_array(img_pixels)
            img_pixels = np.expand_dims(img_pixels, axis=0)

            img_pixels /= 255

            predictions_emo = model_emo.predict(img_pixels)

            predictions_gen = model_gen.predict(face_crop)[0]

            max_index_emo = np.argmax(predictions_emo[0])

            emotion = emotions[max_index_emo]

            idx = np.argmax(predictions_gen)
            label = genders[idx]
            #label = "{}: {:.2f}%".format(label, predictions_gen[idx] * 100)

            # Text to write it on the image if displayed
            overlay_text = "%s  %s  %s" % (label, age, emotion)

            cv2.putText(frame, overlay_text, (x1 + 50, y2 + 50), cv2.FONT_HERSHEY_PLAIN, 1, (255, 255, 255), 2)

            # This is the main comparison/condition part part...
            d = subprocess.check_output("face_recognition --tolerance 0.54 ./Images/known ./Images/unknown")
            ini_string = d
            sstring_strt = ini_string[23:]
            sstring_end = sstring_strt[:-2]
            x = sstring_end.decode("ASCII")
            print(x)
            y = 0

            # if it does't found any person in an image
            if x == "no_persons_found":
                print("blur face")
                continue

            new_x = x[-1:]
            print("Comparing Images")
            if int(float(new_x)) != y:  # This is the condtion in which match found,i.e. repeated customer.
                print('MATCHED')
                os.remove('Images/unknown/' + str(face_id) + '.jpg')  # removing the image from unknown
                print("Matched Image removed from the Unknown Folder")
                # Database code starts
                try:
                    conn = sqlite3.connect('Database/final.db')
                    cursor = conn.cursor()
                    print("Database Donnected")

                    id = str(int(float(new_x)))
                    print("id = " + id)

                    now = datetime.now()
                    date = now.strftime("%d/%m/%Y")
                    time = now.strftime("%H:%M:%S")

                    sql_update_query1 = """ UPDATE cust_image_master SET Counter = Counter + 1 WHERE Customer_ID = (?)"""
                    cursor.execute(sql_update_query1, (id))
                    conn.commit()

                    sql_update_query2 = """ UPDATE customer_master SET Gender = (?) WHERE Customer_ID = (?)"""
                    cursor.execute(sql_update_query2, (label, id))
                    conn.commit()

                    sql_update_query3 = """ UPDATE customer_master SET Age = (?) WHERE Customer_ID = (?)"""
                    cursor.execute(sql_update_query3, (age, id))
                    conn.commit()

                    sql_update_query4 = """ UPDATE customer_master SET Counter = Counter + 1 WHERE Customer_ID = (?)"""
                    cursor.execute(sql_update_query4, (id))
                    conn.commit()

                    c = 'loc2'
                    newcustomer = "NO"
                    cursor.execute(""" INSERT INTO visit_register VALUES (?, ?, ?, ?, ?, ?)""",
                                   (date, time, id, c, newcustomer, emotion))
                    conn.commit()

                    cursor.close()

                except sqlite3.Error as error:
                    print("Failed to Update", error)
                finally:
                    if (conn):
                        conn.close()
                        print("Database Closed")
                # Database code ends


            #######################################################################################################
            else:  # Image not matched...new customer
                print('NOT MATCHED')

                newcustomer = "YES"
                count = 1
                image = face_recognition.load_image_file('Images/unknown/' + str(face_id) + '.jpg')
                face_locations = face_recognition.face_locations(image)
                # finding faces
                for face_location in face_locations:
                    top, right, bottom, left = face_location
                    face_image = image[top:bottom, left:right]
                    pil_image = Image.fromarray(image)
                    pil_image = Image.fromarray(face_image)

                # calculating the number of images present in known folder so
                # that this image would be saved by incrementing the length.
                # eg. let's say there are 4 images in known folder, so if match not found (new customer)
                # next image would be saved as 5.jpg.
                    name1 = str(len(glob.glob('Images/known/*.jpg')) + 1)
                    print("New Customer Saved with "+name1+" .jpg")
                    #print("Image not saved yet")
                    ext = ".jpg"
                    pil_image.save(
                        os.path.join("Images/known", name1 + ext))  # change the path
                    print("New Image stored in Known Folder")
                    # Database code starts #

                    try:
                        conn = sqlite3.connect('Database/final.db')
                        cursor = conn.cursor()
                        print("Database Connected")

                        now = datetime.now()
                        date = now.strftime("%d/%m/%Y")
                        time = now.strftime("%H:%M:%S")

                        c = 'loc2'
                        with open('Images/known/' + name1 + '.jpg', 'rb') as f:
                            data = f.read()
                        cursor.execute(""" INSERT INTO customer_master VALUES (?, ?, ?, ?)""",
                                       (name1, label, age, count))
                        cursor.execute(""" INSERT INTO visit_register VALUES (?, ?, ?, ?, ?, ?)""",
                                       (date, time, name1, c, newcustomer, emotion))
                        cursor.execute(""" INSERT INTO cust_image_master VALUES (?, ? ,?)""",
                                       (name1, data, count))
                        conn.commit()
                        cursor.close()

                    except sqlite3.Error as error:
                        print("Failed to Insert", error)
                    finally:
                        if (conn):
                            conn.close()
                            print("Database Closed")

                    # Database code ends #
                    os.remove('Images/unknown/' + str(face_id) + '.jpg')  # Deleting the image from unknown folder
                    print("Image deleted from Unknown Folder")
                    break

    # displaying the image
    #cv2.imshow("Frame", frame)  # frame showing landmarks, age, emotion and gender

    # Turning of the Webcam
        if cv2.waitKey(5000) & 0xFF == ord('q'):
            break
    except Exception as e:
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        print(exc_type, fname, exc_tb.tb_lineno)

cap.release()
cv2.destroyAllWindows()