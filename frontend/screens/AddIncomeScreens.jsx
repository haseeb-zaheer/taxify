import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SelectList } from "react-native-dropdown-select-list";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import axios from "axios";
import useFinancesStore from "stores/useFinancesStore";
import { getToken } from "utils/authTokenStorage";
import Toast from "react-native-toast-message";


const API_URL = `http://${Constants.expoConfig.extra.apiIp}:8000`;

const AddIncomeScreen = () => {
  const { addIncome } = useFinancesStore();
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState("Salary");
  const [description, setDescription] = useState("");
  const [total, setTotal] = useState("");
  const [iosDatePickerVisible, setIosDatePickerVisible] = useState(false);

  const navigation = useNavigation();

  const categories = [
    { key: "1", value: "Salary" },
    { key: "2", value: "Freelance" },
    { key: "3", value: "Investment" },
  ];

  const showDatePicker = async () => {
    try {
      if (Platform.OS === "android") {
        const { DateTimePickerAndroid } = require("@react-native-community/datetimepicker");
        DateTimePickerAndroid.open({
          value: date,
          onChange: (event, selectedDate) => {
            if (event.type === "set" && selectedDate) {
              setDate(selectedDate);
            }
          },
          mode: "date",
        });
      } else {
        setIosDatePickerVisible(true);
      }
    } catch (error) {
      console.error("Failed to open date picker:", error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };

  const handleSave = async () => {
    const selectedCategory =
      categories.find((item) => item.key === category)?.value || category;

    const incomeData = {
      date: format(date, "yyyy-MM-dd"),
      income_category: selectedCategory,
      description: description,
      total: parseFloat(total),
    };

    try {
      const token = await getToken();
      if (!token) {
        console.error("No access token available!");
        return;
      }

      const response = await axios.post(`${API_URL}/income/add_income`, incomeData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      addIncome(response.data);

      Toast.show({
        type: "success",
        text1: "Income Added",
        text2: "Your income was saved successfully.",
        visibilityTime: 1000,
      });

      setTimeout(() => {
        navigation.goBack();
      }, 1000);

    } catch (error) {
      if (error.response) {
        console.error("Error adding income:", error.response.data.detail || error.response.data);
      } else {
        console.error("Error during API call:", error.message);
      }
    }
  };


return (
  <>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-gray-100 p-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-medium ml-4">Add New Income</Text>
        </View>

        <TouchableOpacity onPress={showDatePicker} className="bg-gray-200 p-4 rounded-lg mb-4">
          <Text>{format(date, "dd/MM/yyyy")}</Text>
        </TouchableOpacity>

        {Platform.OS === "ios" && iosDatePickerVisible && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={iosDatePickerVisible}
            onRequestClose={() => setIosDatePickerVisible(false)}
          >
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              <View style={{ backgroundColor: "white", padding: 20 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                  <TouchableOpacity onPress={() => setIosDatePickerVisible(false)}>
                    <Text style={{ color: "#5B21B6", fontWeight: "bold" }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIosDatePickerVisible(false)}>
                    <Text style={{ color: "#5B21B6", fontWeight: "bold" }}>Done</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ textAlign: "center", marginBottom: 10, fontSize: 16 }}>
                  {format(date, "dd/MM/yyyy")}
                </Text>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  textColor="#000"
                  themeVariant="light"
                />
              </View>
            </View>
          </Modal>
        )}

        <View className="mb-4">
          <SelectList
            setSelected={(selectedKey) => {
              const selectedValue = categories.find((item) => item.key === selectedKey)?.value;
              setCategory(selectedValue || selectedKey);
            }}
            data={categories}
            defaultOption={{ key: "1", value: "Salary" }}
            boxStyles={{
              backgroundColor: "#F3F4F6",
              borderWidth: 0,
              padding: 16,
              borderRadius: 8,
            }}
            dropdownStyles={{
              backgroundColor: "#F3F4F6",
              borderWidth: 0,
            }}
          />
        </View>

        <TextInput
          placeholder="Description (Optional)"
          className="bg-gray-200 p-4 rounded-lg mb-4"
          value={description}
          onChangeText={setDescription}
        />

        <TextInput
          placeholder="Total"
          className="bg-gray-200 p-4 rounded-lg mb-4"
          keyboardType="numeric"
          returnKeyType="done"
          value={total}
          onChangeText={setTotal}
        />

        <View className="flex-row justify-between mt-auto">
          <TouchableOpacity className="flex-1 bg-gray-200 p-4 rounded-lg mr-2" onPress={() => navigation.goBack()}>
            <Text className="text-center">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-purple-700 p-4 rounded-lg ml-2" onPress={handleSave}>
            <Text className="text-center text-white">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>

    <Toast />
  </>
);

};

export default AddIncomeScreen;
