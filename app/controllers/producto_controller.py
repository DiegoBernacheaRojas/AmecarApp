from flask import Blueprint, jsonify
from app import db
from ..models import Producto
from ..utils import login_required

producto = Blueprint('producto', __name__)