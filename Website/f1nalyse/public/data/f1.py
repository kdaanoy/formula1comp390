import fastf1
import pandas as pd
dfcircuit = pd.read_csv("Circuit.csv")
dfsession = pd.read_csv("Session.csv")
dfdrivers = pd.read_csv("Drivers.csv")
dfteams = pd.read_csv("Team.csv")


session = fastf1.get_session(2026, 1, 'R')
session.load()
print(session.laps)
print(session.results)

def store_data(round):
    for i in range(1, 6):
        print(i)

store_data(1)
    