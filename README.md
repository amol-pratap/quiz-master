# quiz-master
Its all in one quiz master where student can test his/her depth knowledge in any topic







#To run Flak-app in my Folder
cd ~/window/MAD-2.P/project/quiz-master
source .env/bin/activate
python main.py


To commit message in this repo

git add .
git commit -m "Git Commit Message: Added search functionality for Admin and Users"
git push origin main

git add .
git commit -m " "
git push origin main



To kill existing process in windows
sudo lsof -i :5000
sudo kill -9 <PID>


To stop redis
sudo systemctl stop redis



To run Flask-app
python3 app.py



For activate redis
redis-server

FOr activate celery (download things)(Run worker)
celery -A app.celery worker --loglevel=info


Foe send Mail(Run beat)
celery -A app.celery beat --loglevel=info


To Run MailHog
~/go/bin/MailHog


