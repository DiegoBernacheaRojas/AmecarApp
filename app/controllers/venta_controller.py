from flask import Blueprint, jsonify
from app import db
from ..models import Venta
from ..utils import login_required

venta = Blueprint('venta', __name__)