"""
Management command to seed the database with sample data.
Usage: python manage.py seed_data
       python manage.py seed_data --clear   (clears existing data first)
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from apps.authentication.models import User
from apps.users.models import Profile
from apps.courses.models import Subject
from apps.lectures.models import Lecture, LectureMaterial


TEACHERS = [
    {
        "email": "dr.sarah.murphy@lecturelens.ie",
        "password": "Teacher@123",
        "full_name": "Dr. Sarah Murphy",
        "bio": "Lecturer in Machine Learning and AI at UCD. 10 years of industry experience.",
    },
    {
        "email": "prof.james.kelly@lecturelens.ie",
        "password": "Teacher@123",
        "full_name": "Prof. James Kelly",
        "bio": "Professor of Software Engineering, specialising in distributed systems.",
    },
]

STUDENTS = [
    {"email": "alice.chen@student.ucd.ie",   "password": "Student@123", "full_name": "Alice Chen"},
    {"email": "bob.oconnor@student.ucd.ie",  "password": "Student@123", "full_name": "Bob O'Connor"},
    {"email": "carol.smith@student.ucd.ie",  "password": "Student@123", "full_name": "Carol Smith"},
    {"email": "david.nguyen@student.ucd.ie", "password": "Student@123", "full_name": "David Nguyen"},
    {"email": "emma.walsh@student.ucd.ie",   "password": "Student@123", "full_name": "Emma Walsh"},
    {"email": "fionn.byrne@student.ucd.ie",  "password": "Student@123", "full_name": "Fionn Byrne"},
]

SUBJECTS = [
    {
        "teacher_email": "dr.sarah.murphy@lecturelens.ie",
        "title": "Machine Learning Systems",
        "description": (
            "An advanced module covering the full ML lifecycle: data pipelines, "
            "model training, evaluation, deployment, and monitoring in production."
        ),
        "student_emails": [
            "alice.chen@student.ucd.ie",
            "bob.oconnor@student.ucd.ie",
            "carol.smith@student.ucd.ie",
            "david.nguyen@student.ucd.ie",
        ],
        "lectures": [
            {
                "title": "Introduction to ML Pipelines",
                "summary": (
                    "Overview of end-to-end machine learning pipelines. We covered "
                    "data ingestion, feature engineering, model training loops, and "
                    "the importance of reproducibility with tools like DVC and MLflow."
                ),
                "materials": [
                    {
                        "m_type": "TRANSCRIPT",
                        "content_text": (
                            "Welcome everyone to Machine Learning Systems. Today we are going to set the scene "
                            "for what the entire module is about.\n\n"
                            "A machine learning pipeline is far more than just training a model. Think of it as "
                            "a factory. Raw data enters at one end, and a production-ready, continuously improving "
                            "model comes out the other end.\n\n"
                            "The key stages we will cover throughout this module are:\n"
                            "1. Data ingestion and validation — making sure the data entering your system is "
                            "clean and meets your schema expectations.\n"
                            "2. Feature engineering — transforming raw data into representations that algorithms "
                            "can learn from effectively.\n"
                            "3. Model training — selecting and fitting algorithms, tuning hyperparameters.\n"
                            "4. Model evaluation — ensuring the model generalises beyond the training set.\n"
                            "5. Model deployment — serving predictions in a reliable, low-latency manner.\n"
                            "6. Monitoring and retraining — detecting drift and triggering retraining when needed.\n\n"
                            "Reproducibility is a first-class concern throughout. We will use DVC for data versioning "
                            "and MLflow for experiment tracking. Both tools are industry standard and free to use.\n\n"
                            "Next lecture we will dive straight into data pipelines with Apache Airflow."
                        ),
                    },
                    {
                        "m_type": "NOTES",
                        "content_text": (
                            "Lecture 1 Notes — ML Pipelines\n\n"
                            "Key takeaways:\n"
                            "- ML is not just modelling; the pipeline is 80% of the work.\n"
                            "- DVC tracks data versions; MLflow tracks experiment metadata.\n"
                            "- Reproducibility = same code + same data + same environment → same result.\n"
                            "- Read: 'Designing Machine Learning Systems' by Chip Huyen (Ch. 1–2)."
                        ),
                    },
                ],
            },
            {
                "title": "Feature Engineering and Data Validation",
                "summary": (
                    "Deep dive into feature stores, data validation with Great Expectations, "
                    "and common pitfalls like target leakage and distribution shift."
                ),
                "materials": [
                    {
                        "m_type": "TRANSCRIPT",
                        "content_text": (
                            "Today we are going to get our hands dirty with feature engineering.\n\n"
                            "Feature engineering is the process of using domain knowledge to create input "
                            "variables that make machine learning algorithms work better. It is often said "
                            "that good features beat a good model — and that is largely true.\n\n"
                            "Common techniques we will look at today:\n"
                            "- Normalisation and standardisation: when to use z-score vs min-max scaling.\n"
                            "- Encoding categoricals: one-hot, ordinal, target encoding — trade-offs of each.\n"
                            "- Handling missing values: mean/median imputation, learned imputation, and flagging.\n"
                            "- Feature crossing: capturing interaction effects between two or more variables.\n\n"
                            "Data validation is equally important. We will use Great Expectations to define "
                            "expectations — assertions about your data — and run them automatically in your pipeline.\n\n"
                            "A critical warning: target leakage. This is when a feature you engineer accidentally "
                            "includes information about the label. Your model will look fantastic in training and "
                            "fail in production. Always split your data before engineering features.\n\n"
                            "Distribution shift happens when your production data no longer looks like your training "
                            "data. We will revisit this in the monitoring lecture, but keep it in mind now."
                        ),
                    },
                ],
            },
            {
                "title": "Model Deployment with FastAPI and Docker",
                "summary": (
                    "Serving ML models via REST APIs using FastAPI, containerising with Docker, "
                    "and deploying to cloud infrastructure."
                ),
                "materials": [
                    {
                        "m_type": "TRANSCRIPT",
                        "content_text": (
                            "Today is a practical lecture. We are going to take a trained model and expose it "
                            "as a REST API that any client can call.\n\n"
                            "FastAPI is our framework of choice. It is asynchronous, auto-generates OpenAPI docs, "
                            "and is extremely performant. Here is the minimal pattern:\n\n"
                            "```python\n"
                            "from fastapi import FastAPI\n"
                            "import joblib\n\n"
                            "app = FastAPI()\n"
                            "model = joblib.load('model.pkl')\n\n"
                            "@app.post('/predict')\n"
                            "def predict(features: dict):\n"
                            "    pred = model.predict([list(features.values())])\n"
                            "    return {'prediction': pred[0]}\n"
                            "```\n\n"
                            "We then containerise this with Docker. A minimal Dockerfile:\n\n"
                            "```dockerfile\n"
                            "FROM python:3.11-slim\n"
                            "WORKDIR /app\n"
                            "COPY requirements.txt .\n"
                            "RUN pip install -r requirements.txt\n"
                            "COPY . .\n"
                            "CMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]\n"
                            "```\n\n"
                            "For cloud deployment we will use AWS ECS (Fargate). The key benefit is serverless "
                            "container orchestration — no EC2 instances to manage. We push the image to ECR and "
                            "define a task definition pointing to that image.\n\n"
                            "Always configure health checks on your /health endpoint. Load balancers use them "
                            "to know which containers are ready to receive traffic."
                        ),
                    },
                    {
                        "m_type": "NOTES",
                        "content_text": (
                            "Lecture 3 Notes — Deployment\n\n"
                            "- FastAPI: async REST framework, auto OpenAPI docs at /docs.\n"
                            "- joblib.load() to deserialise sklearn models; torch.load() for PyTorch.\n"
                            "- Docker: image = code + runtime + dependencies. Reproducible anywhere.\n"
                            "- AWS ECS Fargate: serverless containers. Use ECR for the registry.\n"
                            "- Always expose /health for load-balancer health checks.\n"
                            "- Assignment 2 released today — deploy a model to a cloud endpoint."
                        ),
                    },
                ],
            },
        ],
    },
    {
        "teacher_email": "prof.james.kelly@lecturelens.ie",
        "title": "Distributed Systems Engineering",
        "description": (
            "Core principles of distributed systems: consistency, availability, partition tolerance, "
            "consensus algorithms, and real-world architectures like Kafka and Kubernetes."
        ),
        "student_emails": [
            "carol.smith@student.ucd.ie",
            "david.nguyen@student.ucd.ie",
            "emma.walsh@student.ucd.ie",
            "fionn.byrne@student.ucd.ie",
        ],
        "lectures": [
            {
                "title": "The CAP Theorem and Consistency Models",
                "summary": (
                    "Understanding the CAP theorem, its practical implications, and the spectrum "
                    "of consistency models from eventual to linearisability."
                ),
                "materials": [
                    {
                        "m_type": "TRANSCRIPT",
                        "content_text": (
                            "The CAP theorem, proven by Eric Brewer in 2000 and formalised by Gilbert and Lynch "
                            "in 2002, states that a distributed data store can only guarantee two of the following "
                            "three properties simultaneously:\n\n"
                            "C — Consistency: every read receives the most recent write or an error.\n"
                            "A — Availability: every request receives a response (not necessarily the most recent).\n"
                            "P — Partition Tolerance: the system continues to operate despite network partitions.\n\n"
                            "The crucial insight is that P is not really optional in a real network. Networks do "
                            "partition. Therefore, the real choice is between CP and AP systems.\n\n"
                            "CP systems (e.g. HBase, Zookeeper) will refuse requests rather than return stale data.\n"
                            "AP systems (e.g. Cassandra, CouchDB) will return possibly stale data rather than fail.\n\n"
                            "Consistency models form a spectrum:\n"
                            "- Linearisability (strongest): operations appear instantaneous and globally ordered.\n"
                            "- Sequential consistency: all nodes see the same order, not necessarily real-time.\n"
                            "- Causal consistency: causally related operations are seen in order.\n"
                            "- Eventual consistency (weakest): all replicas converge given enough time.\n\n"
                            "We will see how DynamoDB lets you choose your read consistency per-request, which "
                            "is a great practical example of this trade-off."
                        ),
                    },
                ],
            },
            {
                "title": "Event Streaming with Apache Kafka",
                "summary": (
                    "Architecture of Apache Kafka, producers and consumers, partitioning strategy, "
                    "and building event-driven microservices."
                ),
                "materials": [
                    {
                        "m_type": "TRANSCRIPT",
                        "content_text": (
                            "Apache Kafka is a distributed event streaming platform. Think of it as a "
                            "commit log that multiple producers write to and multiple consumers read from, "
                            "at massive scale.\n\n"
                            "Core concepts:\n"
                            "- Topic: a named log. Producers append messages; consumers read them.\n"
                            "- Partition: topics are split into partitions for parallelism. A partition is "
                            "ordered; across partitions there is no global order.\n"
                            "- Consumer Group: a set of consumers sharing work. Each partition is consumed "
                            "by exactly one consumer in the group at a time.\n"
                            "- Offset: the position of a consumer in a partition. Kafka commits offsets so "
                            "consumers can resume after failure.\n\n"
                            "Kafka's secret is that it is pull-based. Consumers control their pace. "
                            "This prevents consumers from being overwhelmed (backpressure is handled naturally).\n\n"
                            "Partitioning strategy matters enormously. If you partition by user ID, all events "
                            "for a user go to the same partition — preserving per-user ordering. If you use "
                            "random partitioning, you get better load balancing but lose ordering guarantees.\n\n"
                            "Kafka is the backbone of event-driven architectures. We will build a small "
                            "microservices demo in the lab this afternoon."
                        ),
                    },
                    {
                        "m_type": "NOTES",
                        "content_text": (
                            "Lecture 2 Notes — Kafka\n\n"
                            "- Topic → Partitions → Offsets. Understand this hierarchy.\n"
                            "- Consumer Groups allow horizontal scaling of consumers.\n"
                            "- Pull model = natural backpressure. Push model = risk of overwhelming consumers.\n"
                            "- Replication factor ≥ 3 in production for fault tolerance.\n"
                            "- Lab: spin up Kafka with Docker Compose and write a producer/consumer in Python."
                        ),
                    },
                ],
            },
        ],
    },
    {
        "teacher_email": "dr.sarah.murphy@lecturelens.ie",
        "title": "Deep Learning Fundamentals",
        "description": (
            "Foundations of neural networks, backpropagation, CNNs, RNNs, and transformers, "
            "with hands-on PyTorch labs."
        ),
        "student_emails": [
            "alice.chen@student.ucd.ie",
            "emma.walsh@student.ucd.ie",
            "fionn.byrne@student.ucd.ie",
        ],
        "lectures": [
            {
                "title": "Neural Networks and Backpropagation",
                "summary": (
                    "From perceptrons to multi-layer networks. Deriving and implementing "
                    "backpropagation from scratch, understanding vanishing gradients."
                ),
                "materials": [
                    {
                        "m_type": "TRANSCRIPT",
                        "content_text": (
                            "A neural network is, at its core, a composition of functions. Each layer applies "
                            "a linear transformation followed by a non-linear activation function.\n\n"
                            "The universal approximation theorem tells us that a network with a single hidden "
                            "layer and enough neurons can approximate any continuous function on a compact subset "
                            "of R^n. But in practice, depth beats width — deeper networks learn hierarchical "
                            "representations more efficiently.\n\n"
                            "Training a neural network means finding the weights that minimise a loss function. "
                            "We do this with gradient descent:\n"
                            "    w = w - learning_rate * gradient(loss, w)\n\n"
                            "Backpropagation is the algorithm for computing those gradients efficiently using "
                            "the chain rule of calculus. Working backwards from the loss:\n"
                            "    dL/dw = dL/da * da/dz * dz/dw\n\n"
                            "The vanishing gradient problem: when you stack many layers, gradients can shrink "
                            "exponentially as they propagate back through the network. Sigmoid and tanh activations "
                            "are particularly prone to this. The fix? ReLU activations and careful initialisation "
                            "(Xavier/Kaiming).\n\n"
                            "In the lab you will implement a two-layer network with backprop in pure NumPy — "
                            "no PyTorch autograd. This will cement your understanding before we use frameworks."
                        ),
                    },
                ],
            },
            {
                "title": "Attention Mechanisms and Transformers",
                "summary": (
                    "The attention mechanism, multi-head self-attention, positional encoding, "
                    "and the transformer architecture that underpins modern LLMs."
                ),
                "materials": [
                    {
                        "m_type": "TRANSCRIPT",
                        "content_text": (
                            "The transformer architecture, introduced in 'Attention Is All You Need' (Vaswani et al., 2017), "
                            "revolutionised natural language processing and has since spread to vision, audio, and beyond.\n\n"
                            "The key innovation is the self-attention mechanism. For each token in a sequence, "
                            "self-attention computes a weighted sum of all other tokens, where the weights represent "
                            "how relevant each token is to the current one.\n\n"
                            "Mathematically:\n"
                            "    Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V\n\n"
                            "Q (queries), K (keys), and V (values) are linear projections of the input. "
                            "The dot product QK^T measures similarity; dividing by sqrt(d_k) prevents vanishing "
                            "gradients in the softmax when d_k is large.\n\n"
                            "Multi-head attention runs several attention functions in parallel, each learning "
                            "different relationship types (syntax, coreference, semantics, etc.), then concatenates "
                            "and projects the results.\n\n"
                            "Since attention is permutation-invariant, we add positional encodings — either "
                            "fixed sinusoidal embeddings or learned position embeddings.\n\n"
                            "The full transformer block: self-attention → add & norm → feed-forward → add & norm.\n\n"
                            "Modern LLMs like GPT-4 and Claude are autoregressive decoder-only transformers, "
                            "trained to predict the next token. BERT is an encoder-only model trained with masked "
                            "language modelling. T5 uses the full encoder-decoder architecture."
                        ),
                    },
                    {
                        "m_type": "NOTES",
                        "content_text": (
                            "Lecture 2 Notes — Transformers\n\n"
                            "- Attention = weighted sum of values, weights from query-key similarity.\n"
                            "- Scale by sqrt(d_k) to keep gradients stable.\n"
                            "- Multi-head: multiple attention heads learn different relationships.\n"
                            "- Positional encoding: sinusoidal (fixed) or learned.\n"
                            "- Encoder-only (BERT) vs Decoder-only (GPT) vs Encoder-Decoder (T5).\n"
                            "- Read: 'Attention Is All You Need' — it's only 11 pages and very clear.\n"
                            "- Lab: implement scaled dot-product attention in PyTorch."
                        ),
                    },
                ],
            },
        ],
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample teachers, students, subjects, lectures, and materials."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing seeded data before inserting.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write("Clearing existing data...")
            LectureMaterial.objects.all().delete()
            Lecture.objects.all().delete()
            Subject.objects.all().delete()
            Profile.objects.all().delete()
            User.objects.filter(role__in=["TEACHER", "STUDENT"]).exclude(is_superuser=True).delete()
            self.stdout.write(self.style.SUCCESS("Cleared."))

        # --- Create teachers ---
        teacher_objects = {}
        for t in TEACHERS:
            user, created = User.objects.get_or_create(
                email=t["email"],
                defaults={"role": "TEACHER"},
            )
            if created:
                user.set_password(t["password"])
                user.save()
                self.stdout.write(f"  Created teacher: {t['email']}")
            else:
                self.stdout.write(f"  Teacher already exists: {t['email']}")
            Profile.objects.get_or_create(
                user=user,
                defaults={"full_name": t["full_name"], "bio": t["bio"]},
            )
            teacher_objects[t["email"]] = user

        # --- Create students ---
        student_objects = {}
        for s in STUDENTS:
            user, created = User.objects.get_or_create(
                email=s["email"],
                defaults={"role": "STUDENT"},
            )
            if created:
                user.set_password(s["password"])
                user.save()
                self.stdout.write(f"  Created student: {s['email']}")
            else:
                self.stdout.write(f"  Student already exists: {s['email']}")
            Profile.objects.get_or_create(
                user=user,
                defaults={"full_name": s["full_name"]},
            )
            student_objects[s["email"]] = user

        # --- Create subjects, lectures, materials ---
        for subj_data in SUBJECTS:
            teacher = teacher_objects[subj_data["teacher_email"]]
            subject, created = Subject.objects.get_or_create(
                title=subj_data["title"],
                teacher=teacher,
                defaults={"description": subj_data["description"]},
            )
            if created:
                self.stdout.write(f"  Created subject: {subj_data['title']}")
            else:
                self.stdout.write(f"  Subject already exists: {subj_data['title']}")

            # Enrol students
            for email in subj_data["student_emails"]:
                subject.students.add(student_objects[email])

            # Lectures
            for lec_data in subj_data["lectures"]:
                lecture, lec_created = Lecture.objects.get_or_create(
                    title=lec_data["title"],
                    subject=subject,
                    defaults={"summary": lec_data["summary"]},
                )
                if lec_created:
                    self.stdout.write(f"    Created lecture: {lec_data['title']}")

                # Materials
                for mat_data in lec_data["materials"]:
                    LectureMaterial.objects.get_or_create(
                        lecture=lecture,
                        m_type=mat_data["m_type"],
                        defaults={"content_text": mat_data["content_text"]},
                    )

        self.stdout.write(self.style.SUCCESS("\nSeed complete!"))
        self.stdout.write("\nCredentials:")
        self.stdout.write("  Teachers — password: Teacher@123")
        for t in TEACHERS:
            self.stdout.write(f"    {t['email']}")
        self.stdout.write("  Students — password: Student@123")
        for s in STUDENTS:
            self.stdout.write(f"    {s['email']}")
