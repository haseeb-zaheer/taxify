from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from routes import auth, income, expense, receipt, form
from models.base import Base
from database import engine

import models.user
import models.income_model
import models.expense_model
import models.receipt_model

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router, prefix='/auth')
app.include_router(income.router, prefix='/income')
app.include_router(expense.router, prefix='/expense')
app.include_router(receipt.router, prefix='/receipt')
app.include_router(form.router, prefix='/form')


Base.metadata.create_all(engine)
