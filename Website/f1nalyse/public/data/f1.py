from datetime import datetime
import sys
import fastf1
import pandas as pd
from sklearn.model_selection import GridSearchCV, train_test_split
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error

dfcircuit = pd.read_csv("Circuit.csv")
dfsession = pd.read_csv("Session.csv")
dfdrivers = pd.read_csv("Drivers.csv")
dfteams = pd.read_csv("Team.csv")
dfresults = pd.read_csv("Results.csv")
dflaps = pd.read_csv("Laps.csv")
dfwcc = pd.read_csv("WCC.csv")

# Define the drivers and teams for the 2026 season
drivers_2026 = pd.DataFrame({
    "Driver": ["Lando Norris", "Oscar Piastri", "Max Verstappen", "Isack Hadjar",
               "Lewis Hamilton", "Charles Leclerc", "Alexander Albon", "Carlos Sainz",
               "Sergio Perez", "Valtteri Bottas", "Fernando Alonso", "Lance Stroll",
               "Pierre Gasly", "Franco Colapinto", "George Russell", "Kimi Antonelli",
               "Nico Hulkenberg", "Gabriel Bortoleto", "Esteban Ocon", "Oliver Bearman",
               "Liam Lawson", "Arvid Lindblad"],
    
    "Team": ["McLaren", "McLaren", "Red Bull", "Red Bull",
             "Ferrari", "Ferrari", "Williams", "Williams",
             "Cadillac", "Cadillac", "Aston Martin", "Aston Martin",
             "Alpine F1 Team", "Alpine F1 Team", "Mercedes", "Mercedes",
             "Audi", "Audi", "Haas F1 Team", "Haas F1 Team",
             "RB F1 Team", "RB F1 Team"]
})

def store_data(round):
    resultID = dfresults["ResultID"].iloc[-1] + 1
    last_lap_id = dflaps["LapID"].iloc[-1] + 1

    for i in range (1, 6):
        session = fastf1.get_session(2026, round, i)
        session.load()

        raceSchedule = fastf1.get_event(2026, round)

        # Create the session input string for loading in the session from FastF1 API
        sessionInput = 'Session' + str(i)

        # Filter through the circuit table to find the matching city
        df_filtered = dfcircuit[(dfcircuit["City"] == raceSchedule['Location'])]

        laps = session.laps
        
        last_id = dfsession["ID"].iloc[-1]
        
        # If the length of the filtered data fram is not 0...
        if len(df_filtered) != 0:

            # Use a try catch block to attempt to load the session and weather data
            try:
                # Load the session from FastF1 API and set the laps and telemetry to false
                session = fastf1.get_session(2026, round, i)
                session.load(laps = False, telemetry = False)

                # Get the weather data from the session
                weather = session.weather_data

                # Create a new row with the data retrieved
                row = {"ID": last_id + i, "Type": raceSchedule[sessionInput], "CircuitID": df_filtered.iloc[0]["ID"], "DateOfSession": raceSchedule[sessionInput + 'DateUtc'],
                    "Temperature": weather.head(1)['AirTemp'].iloc[0], "RaceLaps": laps['LapNumber'].max().astype(int)}
                
            except Exception:
                # Used to debug which sessions failed
                print(0)

                # Create a new row with default data
                row = {"ID": last_id + i, "Type": raceSchedule[sessionInput], "CircuitID": df_filtered.iloc[0]["ID"], "DateOfSession": raceSchedule[sessionInput + 'DateUtc'],
                    "Temperature": 0, "RaceLaps": laps['LapNumber'].max().astype(int)}
                
            # Append the new row to the file
            pd.DataFrame([row]).to_csv("Session.csv", mode="a", header=False, index=False, lineterminator="\n")
                
            # Used to debug which ids were used
            print(df_filtered.iloc[0]["ID"])

        # Handle special cases where the city name doesnt match any track in the Circuit table
        elif (raceSchedule['Country'] == "Brazil"):

            # Filter through to find the Brazil circuit
            df_filtered = dfcircuit[(dfcircuit["Country"] == "Brazil")]
            try:
                #Load the session, weather and add row
                session = fastf1.get_session(2026, round, i)
                session.load(laps = False, telemetry = False)
                weather = session.weather_data
                row = {"ID": last_id + i, "Type": raceSchedule[sessionInput], "CircuitID": df_filtered.iloc[0]["ID"], "DateOfSession": raceSchedule[sessionInput + 'DateUtc'],
                    "Temperature": weather.head(1)['AirTemp'].iloc[0], "RaceLaps": laps['LapNumber'].max().astype(int)}
            
            # Catch any exceptions and add a default row
            except Exception:
                print(0)
            
                row = {"ID": last_id + i, "Type": raceSchedule[sessionInput], "CircuitID": df_filtered.iloc[0]["ID"], "DateOfSession": raceSchedule[sessionInput + 'DateUtc'],
                    "Temperature": 0, "RaceLaps": laps['LapNumber'].max().astype(int)}
                
            pd.DataFrame([row]).to_csv("Session.csv", mode="a", header=False, index=False, lineterminator="\n")
            
        # Similar to Brazil, handle the case for Canada
        elif (raceSchedule['Country'] == "Canada"):
            df_filtered = dfcircuit[(dfcircuit["Country"] == "Canada")]
            try:
                session = fastf1.get_session(2026, round, i)
                session.load(laps = False, telemetry = False)
                weather = session.weather_data
                row = {"ID": last_id + i, "Type": raceSchedule[sessionInput], "CircuitID": df_filtered.iloc[0]["ID"], "DateOfSession": raceSchedule[sessionInput + 'DateUtc'],
                    "Temperature": weather.head(1)['AirTemp'].iloc[0], "RaceLaps": laps['LapNumber'].max()}
            except Exception:
                print(0)
            
                row = {"ID": last_id + i, "Type": raceSchedule[sessionInput], "CircuitID": df_filtered.iloc[0]["ID"], "DateOfSession": raceSchedule[sessionInput + 'DateUtc'],
                    "Temperature": 0, "RaceLaps": laps['LapNumber'].max().astype(int)}
                
            pd.DataFrame([row]).to_csv("Session.csv", mode="a", header=False, index=False, lineterminator="\n")

        # Handle the case for Germany
        elif (raceSchedule['Country'] == "Germany"):
            df_filtered = dfcircuit[(dfcircuit["Country"] == "Germany")]
            try:
                session = fastf1.get_session(2026, round, i)
                session.load(laps = False, telemetry = False)
                weather = session.weather_data
                row = {"ID": last_id + i, "Type": raceSchedule[sessionInput], "CircuitID": df_filtered.iloc[0]["ID"], "DateOfSession": raceSchedule[sessionInput + 'DateUtc'],
                    "Temperature": weather.head(1)['AirTemp'].iloc[0], "RaceLaps": laps['LapNumber'].max().astype(int)}
            except Exception:
                print(0)
            
                row = {"ID": last_id + i, "Type": raceSchedule[sessionInput], "CircuitID": df_filtered.iloc[0]["ID"], "DateOfSession": raceSchedule[sessionInput + 'DateUtc'],
                    "Temperature": 0, "RaceLaps": laps['LapNumber'].max().astype(int)}
                
            pd.DataFrame([row]).to_csv("Session.csv", mode="a", header=False, index=False, lineterminator="\n")
            
        # Handle the case for Abu Dhabi
        elif (raceSchedule['Location'] == "Yas Island"):
            df_filtered = dfcircuit[(dfcircuit["City"] == "Abu Dhabi")]
            try:
                session = fastf1.get_session(2026, round, i)
                session.load(laps = False, telemetry = False)
                weather = session.weather_data
                row = {"ID": last_id + i, "Type": raceSchedule[sessionInput], "CircuitID": df_filtered.iloc[0]["ID"], "DateOfSession": raceSchedule[sessionInput + 'DateUtc'],
                    "Temperature": weather.head(1)['AirTemp'].iloc[0], "RaceLaps": laps['LapNumber'].max().astype(int)}
            except Exception:
                print(0)
            
                row = {"ID": last_id + i, "Type": raceSchedule[sessionInput], "CircuitID": df_filtered.iloc[0]["ID"], "DateOfSession": raceSchedule[sessionInput + 'DateUtc'],
                    "Temperature": 0, "RaceLaps": laps['LapNumber'].max().astype(int)}
                
            pd.DataFrame([row]).to_csv("Session.csv", mode="a", header=False, index=False, lineterminator="\n")

        if (i != 5):
            # Retrieve the fastest lap time by the driver
            fastest_laps = laps.groupby("Driver")["LapTime"].min().reset_index()
            fastest_laps = fastest_laps.sort_values("LapTime")
            print(fastest_laps)
            
            # Loop through each driver and retrieve the driver name, time gap to the fastest lap time and append it to the Results table
            position = 1
            for lap in fastest_laps.itertuples():
                driver = session.get_driver(lap.Driver)["FullName"]
                print(fastest_laps)
                
                # If the position is 1, then the time gap is 0 because they are the fastest
                if position == 1:
                    timegap = fastest_laps.iloc[0]["LapTime"].total_seconds()
                else:
                    timegap = (lap.LapTime - fastest_laps.iloc[0]["LapTime"]).total_seconds()

                row = {"ResultID": resultID, "SessionID": last_id + i, "Position": position, "Driver": driver, "TimeGap": timegap, "FinishTime": lap.LapTime.total_seconds()}
                pd.DataFrame([row]).to_csv("Results.csv", mode="a", header=False, index=False, lineterminator="\n")
                
                # Increment the position for the next driver
                position += 1
                resultID += 1
            
        else:
            results = session.results

            fastest_laps = laps.groupby("Driver")["LapTime"].min().reset_index()
            fastest_laps = fastest_laps.sort_values("LapTime")
            print(fastest_laps)
            
            position = 1
            for row in results.itertuples():
                if position == 1:
                    finish_time = results['Time'].iloc[0].total_seconds()
                else:
                    finish_time = results['Time'].iloc[0].total_seconds() + row.Time.total_seconds()

                driver = results['FirstName'].iloc[position - 1] + " " + results['LastName'].iloc[position - 1]
                timegap = results['Time'].iloc[position - 1].total_seconds()
                print(timegap)

                row = {"ResultID": resultID, "SessionID": last_id + i, "Position": position, "Driver": driver, "TimeGap": timegap, "FinishTime": finish_time}
                pd.DataFrame([row]).to_csv("Results.csv", mode="a", header=False, index=False, lineterminator="\n")

                position += 1
                resultID += 1

        for indx, lap in laps.iterlaps():
            lap_number = lap['LapNumber']
            driver_code = lap['Driver']
            driver_name = session.get_driver(driver_code)["FullName"]
            print(driver_name)
            if driver_name == "Sergio Perez":
                driver_name = "Sergio Pérez"
            elif driver_name == "Nico Hulkenberg":
                driver_name = "Nico Hülkenberg"
            elif driver_name == "Kimi Raikkonen":
                driver_name = "Kimi Räikkönen"
            else:
                driver_name = driver_name
            driver_teamname = session.get_driver(driver_code)["TeamName"]
            if driver_teamname == "Red Bull Racing":
                driver_teamname = "Red Bull"
            print(driver_teamname)
            dfteam = pd.read_csv("Team.csv")
            team_id = dfteam[dfteam["TeamName"] == driver_teamname]["ID"].iloc[0]
            print(team_id)
            try:
                driver_id = dfdrivers[(dfdrivers["DriverName"] == driver_name) & (dfdrivers["TeamID"] == team_id)]["ID"].iloc[0]
            except IndexError:
                print(f"Driver {driver_name} not found in team {driver_teamname}")
                continue
            sector1_time = lap['Sector1Time']
            sector2_time = lap['Sector2Time']
            sector3_time = lap['Sector3Time']
            lap_time = lap['LapTime']
            fastest_lap_time = fastest_laps[fastest_laps["Driver"] == driver_code]["LapTime"].iloc[0]
            if fastest_lap_time == lap_time:
                fastest_lap = 1
            else:
                fastest_lap = 0
            tyre_compound = lap['Compound']
            
            row = {"ID": last_lap_id + i, "SessionID": last_id + 1, "DriverID": driver_id, "Sector1Time": sector1_time, "Sector2Time": sector2_time, "Sector3Time": sector3_time,
                   "FastestLapTime": fastest_lap, "LapTime": lap_time, "TyreCompound": tyre_compound, "LapNumber": lap_number, "LapTimeSeconds": lap_time.total_seconds()}
            
            print(row)
            pd.DataFrame([row]).to_csv("Laps.csv", mode="a", header=False, index=False)
            
            last_lap_id += 1
    
def get_driver_data(year):
    # for index, row in dfcircuits.iterrows():
    #     if row['Country'] == country and row['City'] == city:
    #         circuit_id = row['ID']
    #         break
    #     else:
    #         circuit_id = None

    # This will be where each row of data for each driver will be stored before converting into a data frame
    data = []
    
    # Loop through each session in the Session table to find the sessions for the given year where it is a race and retrieve the circuit information
    for index, row1 in dfsession.tail(5).iterrows():
        try:
            session_year = datetime.strptime(row1['DateOfSession'], "%Y-%m-%d %H:%M:%S").year
        except ValueError:
            session_year = datetime.strptime(row1['DateOfSession'], "%d/%m/%Y %H:%M").year
        if session_year == int(year) and row1['Type'] == 'Race':
            session_id = row1['ID']
            circuit_id = row1['CircuitID']
            circuit = dfcircuit[dfcircuit['ID'] == circuit_id].head()['Name']
            track_length = dfcircuit[dfcircuit['ID'] == circuit_id].head()['Length']
            num_corners = dfcircuit[dfcircuit['ID'] == circuit_id].head()['Corners']
            is_street_circuit = dfcircuit[dfcircuit['ID'] == circuit_id].head()['IsStreet']

            # Loop through the results of the table to find if any 2026 drivers have participated in the race 1 year before the current
            for index, row in dfresults.iterrows():
                if row['SessionID'] == session_id:
                    driver = row['Driver']
                                        # Use a try exception block to check the team of the driver in the previous season
                    try:    
                        teamID = dfdrivers[(dfdrivers['DriverName'] == driver) & (dfdrivers['Year'] == int(year))].iloc[0]['TeamID']
                        print(teamID)
                        team = dfteams[dfteams['ID'] == teamID].head()['TeamName']
                    except:
                        team = pd.Series(["Unknown"])
                    
                    if driver in drivers_2026['Driver'].values:
                        # Retrieve the position of the driver in that race
                        position = row['Position']

                        # Set up a list to store positions of the driver before that race
                        positions = []

                        # Loop through each session to retrieve the positions of the driver in the previous season
                        for index, row in dfsession.iterrows():
                            try:
                                session_year = datetime.strptime(row['DateOfSession'], "%Y-%m-%d %H:%M:%S").year
                            except ValueError:
                                session_year = datetime.strptime(row['DateOfSession'], "%d/%m/%Y %H:%M").year
                            if session_year == int(year) - 1 and row['Type'] == 'Race':
                                dfresultsdrivers = dfresults[(dfresults['SessionID'] == row['ID']) & (dfresults['Driver'] == driver)]
                                for index, row in dfresultsdrivers.iterrows():
                                    positions.append(row['Position'])

                        last3avg = []
                        last5avg = []
                        last3teammateavg = []
                        last5teammateavg = []

                        previous_sessions5 = dfsession[(dfsession['Type'] == 'Race' ) & (dfsession['ID'] < session_id)]['ID'][-5:]

                        dfrestofdrivers = dfresults[(dfresults['SessionID'] == session_id) & (dfresults['Driver'] != driver)]

                        # Loop through all other drivers in the same race
                        for index, row_other in dfrestofdrivers.iterrows():
                            # Skip if it's the same driver
                            if row_other['Driver'] == driver:
                                continue

                            # Get the other driver's team
                            other_driver_row = dfdrivers[(dfdrivers['DriverName'] == row_other['Driver']) & (dfdrivers['Year'] == int(year))]
                            if not other_driver_row.empty:
                                other_team_id = other_driver_row.iloc[0]['TeamID']
                                other_team_name = dfteams[dfteams['ID'] == other_team_id]['TeamName'].iloc[0]

                                # Check if the other driver is in the same team
                                if other_team_name == team.iloc[0]:
                                    teammate_name = row_other['Driver']
                                    print(f"Driver: {driver}, Teammate: {teammate_name}")
                                
                        
                        loop = 0
                        for index, row in dfsession.iterrows():
                            if row['ID'] in previous_sessions5:
                                dfresultsdrivers = dfresults[(dfresults['SessionID'] == row['ID']) & (dfresults['Driver'] == driver)]
                                dfresultsteammate = dfresults[(dfresults['SessionID'] == row['ID']) & (dfresults['Driver'] == teammate_name)]
                                loop += 1
                                print("Loop", loop)
                                print("ID:", row['ID'])
                                for index, row in dfresultsdrivers.iterrows():
                                    last5avg.append(row['Position'])
                                    if (loop >= 3):
                                        last3avg.append(row['Position'])

                                for index, row in dfresultsteammate.iterrows():
                                    last5teammateavg.append(row['Position'])
                                    if (loop >= 3):
                                        last3teammateavg.append(row['Position'])


                        last3avg = sum(last3avg) / len(last3avg) if len(last3avg) > 0 else 10
                        print(last3avg)
                        last5avg = sum(last5avg) / len(last5avg) if len(last5avg) > 0 else 10
                        print(last5avg)
                        last3teammateavg = sum(last3teammateavg) / len(last3teammateavg) if len(last3teammateavg) > 0 else 10
                        print(last3teammateavg)
                        last5teammateavg = sum(last5teammateavg) / len(last5teammateavg) if len(last5teammateavg) > 0 else 10
                        print(last5teammateavg)

                        for index, row in dfresults.iterrows():
                            if row['SessionID'] == session_id-1 and row['Driver'] == driver:
                                qualifyingpos = row['Position']
                                break

                        # Calculate the average position of the driver in the previous season
                        average_last_season = sum(positions) / len(positions) if len(positions) > 0 else 10
                        
                        # Check if the driver is a rookie by 
                        last_year_drivers = dfdrivers[dfdrivers['Year'] == int(year) - 1]
                        if driver not in last_year_drivers['DriverName'].values:
                            is_rookie = 1 
                            last3avg = 10
                        else:
                            is_rookie = 0
                        print(driver)

                        # Use a try exception block to check the team of the driver in the previous season
                        try:    
                            teamID = dfdrivers[(dfdrivers['DriverName'] == driver) & (dfdrivers['Year'] == int(year))].iloc[0]['TeamID']
                            print(teamID)
                            team = dfteams[dfteams['ID'] == teamID].head()['TeamName']
                        except:
                            team = pd.Series(["Unknown"])
                        
                        # Set a new list for the career positions of the driver and a dnf counter to calculate the dnf rate of the driver
                        career_positions = []
                        dnf = 0

                        # Loop through the sessions again to retrieve the positions for all drivers
                        for index, row in dfsession.iterrows():
                            if row['Type'] == 'Race' and row['ID'] <= session_id:
                                dfresultsdrivers = dfresults[(dfresults['SessionID'] == row['ID']) & (dfresults['Driver'] == driver)]
                                for index, row in dfresultsdrivers.iterrows():
                                    career_positions.append(row['Position'])
                                    if str(row['TimeGap']).strip() == "":
                                        print(row['TimeGap']) 
                                        dnf += 1
                                        
                        # Calculate the career average position of the driver if the driver has participated
                        career_average = sum(career_positions) / len(career_positions) if len(career_positions) > 0 else 10

                        # Calculate the wcc position of the drivers team last year
                        last_year_team_wcc = dfwcc[(dfwcc['Year'] == int(year) - 1) & (dfwcc['Team'] == team.iloc[0])]    

                        # Append the data for that driver
                        data.append({
                            "Driver": driver,
                            "Circuit": circuit.iloc[0],
                            "TrackLengthKm": track_length.iloc[0],
                            "NumCorners": num_corners.iloc[0],
                            "IsStreetCircuit": is_street_circuit.iloc[0],
                            "isRookie": is_rookie,
                            "Team": team.iloc[0],
                            "QualifyingPosition": qualifyingpos,
                            "Last3Avg": last3avg,
                            "Last5Avg": last5avg,
                            "TeammateLast3Avg": last3teammateavg,
                            "TeammateLast5Avg": last5teammateavg,
                            "Average_Last_Season": average_last_season,
                            "Career_Average": career_average,
                            "DNFRate": dnf/len(career_positions),
                            "LastYrTeamWCC": last_year_team_wcc.iloc[0]['Position'] if not last_year_team_wcc.empty else 10,
                            "Position": position})
        else:
            continue
                    
    # Return the data frame of that data
    return pd.DataFrame(data)

def set_2026_features(city, country):

    qualifying = {'George Russell': 1, 'Kimi Antonelli': 2, 'Isack Hadjar': 3, 'Charles Leclerc': 4, 'Oscar Piastri': 5, 'Lando Norris': 6, 'Lewis Hamilton': 7, 'Liam Lawson': 8, 'Arvid Lindblad': 9,
                  'Gabriel Bortoleto': 10, 'Nico Hulkenberg': 11, 'Oliver Bearman': 12, 'Esteban Ocon': 13, 'Pierre Gasly': 14, 'Alexander Albon': 15, 'Franco Colapinto': 16, 'Fernando Alonso': 17, 'Sergio Perez': 18, 'Valtteri Bottas': 19, 'Max Verstappen': 20,
                  'Carlos Sainz': 21, 'Lance Stroll': 22}

    # This will be where each row of data for each driver will be stored before converting into a data frame
    data = []

    # Loops through each driver in the 2026 season
    for index, row in drivers_2026.iterrows():

        #Assigns the driver and team variables
        driver = row['Driver']
        team = row['Team']

        # Set up a list to store positions of the driver in the 2025 season
        positions = []
        for index, row in dfsession.iterrows():
            try:
                session_year = datetime.strptime(row['DateOfSession'], "%Y-%m-%d %H:%M:%S").year
            except ValueError:
                session_year = datetime.strptime(row['DateOfSession'], "%d/%m/%Y %H:%M").year
            if session_year == 2025 and row['Type'] == 'Race':
                dfresultsdrivers = dfresults[(dfresults['SessionID'] == row['ID']) & (dfresults['Driver'] == driver)]
                for index, row in dfresultsdrivers.iterrows():
                    positions.append(row['Position'])
        
        # Calculate the average position of the driver 
        average_last_season = sum(positions) / len(positions) if len(positions) > 0 else 10

        # Loops through the circuits table to retrieve the information about the circuit
        for index, row in dfcircuit.iterrows():
            if row['Country'] == country and row['City'] == city:
                circuit_id = row['ID']
                circuit = row['Name']
                track_length = row['Length']
                num_corners = row['Corners']
                is_street_circuit = row['IsStreet']
                break
            else:
                circuit_id = None

        last3avg = []
        last5avg = []
        teammatelast3avg = []
        teammatelast5avg = []
        
        loop = 0
        dflast5sessions = dfsession[(dfsession['Type'] == 'Race' )]['ID'][-5:]
        for sessionid in dflast5sessions:
            if row['ID'] in dflast5sessions:
                dfresultsdrivers = dfresults[(dfresults['SessionID'] == sessionid) & (dfresults['Driver'] == driver)]
                loop += 1
                for index, row in dfresultsdrivers.iterrows():
                    last5avg.append(row['Position'])
                    if (loop >= 3):
                        last3avg.append(row['Position'])

                dfrestofdrivers = dfresults[(dfresults['SessionID'] == sessionid) & (dfresults['Driver'] != driver)]

                # Loop through all other drivers in the same race
                for index, row_other in dfrestofdrivers.iterrows():
                    # Skip if it's the same driver
                    if row_other['Driver'] == driver:
                        continue

                    # Get the other driver's team
                    other_driver_row = dfdrivers[(dfdrivers['DriverName'] == row_other['Driver']) & (dfdrivers['Year'] == int(2026))]
                    if not other_driver_row.empty:
                        other_team_id = other_driver_row.iloc[0]['TeamID']
                        other_team_name = dfteams[dfteams['ID'] == other_team_id]['TeamName'].iloc[0]

                        # Check if the other driver is in the same team
                        if other_team_name == team.iloc[0]:
                            teammate_name = row_other['Driver']

                for index, row in dfresults.iterrows():
                    if row['SessionID'] == row['ID'] and row['Driver'] == teammate_name:
                        teammatelast5avg.append(row['Position'])
                        if (loop >= 3):
                            teammatelast3avg.append(row['Position'])
                                
        last3avg = sum(last3avg) / len(last3avg) if len(last3avg) > 0 else 10
        last5avg = sum(last5avg) / len(last5avg) if len(last5avg) > 0 else 10
        teammatelast3avg = sum(teammatelast3avg) / len(teammatelast3avg) if len(teammatelast3avg) > 0 else 10
        teammatelast5avg = sum(teammatelast5avg) / len(teammatelast5avg) if len(teammatelast5avg) > 0 else 10
                
        
        # Sets a list for career positions and a dnf counter for the driver
        career_positions = []
        dnf = 0

        # Loops through the sessions again to retrieve the positions for all drivers
        for index, row in dfsession.iterrows():
            if row['Type'] == 'Race' :
                dfresultsdrivers = dfresults[(dfresults['SessionID'] == row['ID']) & (dfresults['Driver'] == driver)]
                for index, row in dfresultsdrivers.iterrows():
                    career_positions.append(row['Position'])
                    if str(row['TimeGap']).strip() == "":
                        print(row['TimeGap']) 
                        dnf += 1
        
        # Calculates the career average if the driver has participated
        career_average = sum(career_positions) / len(career_positions) if len(career_positions) > 0 else 10

        # Use a try exception block to check if the drivers team had a wcc position last year
        try:
            # Retrieve the wcc position
            last_year_team_wcc = dfwcc[(dfwcc['Year'] == 2024) & (dfwcc['Team'] == team)].iloc[0]['Position']
            print(last_year_team_wcc)
        except:
            # Set the default to 10 if the team did not participate
            last_year_team_wcc = 10

        # If the driver is Arvid, then he is a rookie so it will be set to median variables
        if driver == "Arvid Lindblad":
            isRookie = 1
            dnf_rate = 0.5
            average_last_season = 10
            
        # For these drivers, they did not participate last season but they have had a long career
        elif driver == "Sergio Perez" or driver == "Valtteri Bottas":
            isRookie = 0
            average_last_season = 10
            last_year_team_wcc = 5
            dnf_rate = dnf/len(career_positions)

        # Otherwise set a default dnf rate if they did not have any races
        else:
            isRookie = 0
            if len(career_positions) != 0:
                dnf_rate = dnf/len(career_positions)
            else:
                dnf_rate = 0.5
        
        # Append the data for that driver   
        data.append({
            "Driver": driver,
            "Circuit": circuit,
            "TrackLengthKm": track_length,
            "NumCorners": num_corners,
            "IsStreetCircuit": is_street_circuit,
            "isRookie": isRookie,
            "Team": team,
            "QualifyingPosition": qualifying[driver],
            "Last3Avg": last3avg,
            "Last5Avg": last5avg,
            "TeammateLast3Avg": teammatelast3avg,
            "TeammateLast5Avg": teammatelast5avg,
            "Average_Last_Season": average_last_season,
            "Career_Average": career_average,
            "DNFRate": dnf_rate,
            "LastYrTeamWCC": last_year_team_wcc
        })

    # Return the data frame
    return pd.DataFrame(data)

def train(city, country):
    all_driver_data = pd.read_csv("driver_data.csv")

    # Use encoding to convert the categorical variables into numerical
    from sklearn.preprocessing import LabelEncoder
    all_driver_data['TeamEncoded'] = LabelEncoder().fit_transform(all_driver_data['Team'])
    all_driver_data['CircuitEncoded'] =  LabelEncoder().fit_transform(all_driver_data['Circuit'])

    # Set the features and target variables for the model
    x = all_driver_data[["TrackLengthKm", "NumCorners", "IsStreetCircuit", "isRookie", "TeamEncoded", "QualifyingPosition", "Last3Avg", "Last5Avg", "TeammateLast3Avg", "TeammateLast5Avg", "Average_Last_Season", "Career_Average", "DNFRate", "LastYrTeamWCC", "CircuitEncoded"]]
    y = all_driver_data["Position"]

    # Split the data into training and testing sets and train it
    X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=38)

    param_grid = {
        "n_estimators": [200, 300, 400, 500, 600],
        "learning_rate": [0.01, 0.05, 0.1],
        "max_depth": [4, 6, 8],
        "subsample": [0.8, 1.0],
        "colsample_bytree": [0.8, 1.0]
    }

    model = XGBRegressor(random_state=38)

    grid_search = GridSearchCV(
        estimator=model,
        param_grid=param_grid,
        scoring="neg_mean_absolute_error",
        cv=5,
        verbose=1,
        n_jobs=-1
    )

    grid_search.fit(X_train, y_train)

    print(f"Best Parameters: {grid_search.best_params_}")
    print(f"Best MAE: {-grid_search.best_score_:.2f} positions")

    # Set the features for the 2026 season and make the predictions
    race1 = (set_2026_features(city, country))
    race1['TeamEncoded'] = LabelEncoder().fit_transform(race1['Team'])
    race1['CircuitEncoded'] =  LabelEncoder().fit_transform(race1['Circuit'])
    race_predictions = race1[["TrackLengthKm", "NumCorners", "IsStreetCircuit", "isRookie", "TeamEncoded", "QualifyingPosition", "Last3Avg", "Last5Avg", "TeammateLast3Avg", "TeammateLast5Avg", "Average_Last_Season", "Career_Average", "DNFRate", "LastYrTeamWCC", "CircuitEncoded"]]
    predictions = grid_search.best_estimator_.predict(race_predictions)
    race1['Position'] = predictions
    race1 = race1.sort_values(by="Position")
    print(race1)
    race1.to_csv("Website/f1nalyse/public/data/race" + str(round) + "_predictions.csv", index=False)

    # Evaluate the error of the model
    y_pred = grid_search.best_estimator_.predict(X_test)
    print(f"\nModel Error (MAE): {mean_absolute_error(y_test, y_pred):.2f} positions")

def get_city_country(round):
    raceSchedule = fastf1.get_event(2026, round)
    city = raceSchedule['Location']
    country = raceSchedule['Country']
    
    return city, country

# store_data(1)
# train("Melbourne", "Australia")

if __name__ == "__main__":
    action = sys.argv[1]

    if action == "storeData":
        round = int(sys.argv[2])
        store_data(round)
    elif action == "updateData":
        get_driver_data(2026).to_csv("driver_data.csv", index=False)
    elif action == "train":
        round = int(sys.argv[2])
        city, country = get_city_country(round)
        train(city, country)
        


    